const ErrorResponse = require('../core/error.response')
const ORDER_MODEL = require('../models/order.model')
const { getCountDocumentsByFilter } = require('../models/repositories/index.repo')
const { getUnSelectData } = require('../utils')


class OrderService {

    static getOrdersByUser = (userId) => {
        return ORDER_MODEL.find({ order_user: userId }).sort({ createdAt: -1 }).select(getUnSelectData(['order_product'])).lean()
    }

    static getOrderByUser = (orderId) => {
        return ORDER_MODEL.findById(orderId).populate('order_user', 'user_name').lean()
    }

    static updateStatusOrder = async ({ orderId, newStatus }) => {
        const foundOrder = await ORDER_MODEL.findById(orderId)

        if (!foundOrder) {
            throw new ErrorResponse("Đơn hàng không tồn tại.", 400)
        }
        foundOrder.order_status = newStatus
        await foundOrder.save()

        return 1
    }

    static getAllOrderByAdmin = async ({ page = 1, limit = 10, search = null }) => {
        const skip = (page - 1) * limit
        let filter = {}
        if (search) {
            const regexSearch = new RegExp(search, 'i')
            filter['order_trackingNumber'] = { $regex: regexSearch }
        }

        const [orders, totalItems] = await Promise.all([
            ORDER_MODEL.find(filter).skip(skip).limit(limit).populate('order_user', 'user_name').sort({ createdAt: -1 }).lean(),
            getCountDocumentsByFilter(ORDER_MODEL, filter),
        ])

        const totalPages = Math.ceil(totalItems / limit)

        return {
            data: orders,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        }
    }

    static analyticOrder = async () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);

        const [totalOrders, totalRevenue, orderByDate, orderStatusData] = await Promise.all([
            getCountDocumentsByFilter(ORDER_MODEL),
            ORDER_MODEL.aggregate([
                {
                    $match: { order_status: "delivered" } // Chỉ lấy đơn đã hoàn thành
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$order_checkout.totalCheckout" }
                    }
                }
            ]),
            ORDER_MODEL.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: sevenDaysAgo,
                            $lte: today,
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                        },
                        orders: { $sum: 1 }
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: {
                            $dateToString: { format: "%d/%m", date: { $dateFromString: { dateString: "$_id" } } },
                        },
                        orders: 1,
                    },
                }
            ]),
            ORDER_MODEL.aggregate([
                {
                    $group: {
                        _id: "$order_status", // Nhóm theo order_status
                        count: { $sum: 1 }    // Đếm số lượng của từng trạng thái
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: '$_id',
                        value: '$count',
                        color: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$_id", "pending"] }, then: "#991B1B" }, // text-red-800
                                    { case: { $eq: ["$_id", "confirmed"] }, then: "#854D0E" }, // text-yellow-800
                                    { case: { $eq: ["$_id", "shipped"] }, then: "#1E3A8A" }, // text-blue-800
                                    { case: { $eq: ["$_id", "cancelled"] }, then: "#1F2937" }, // text-gray-800
                                    { case: { $eq: ["$_id", "delivered"] }, then: "#166534" }, // text-green-800
                                ],
                                default: "#000000",
                            },
                        },
                    }
                }
            ])
        ])

        const dateRange = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            const formattedDate = date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
            });
            dateRange.push(formattedDate);
        }

        // Đảm bảo tất cả 7 ngày đều có trong kết quả, kể cả ngày không có đơn hàng
        const dailyOrdersData = dateRange.map(date => {
            const found = orderByDate.find(item => item.date === date);
            return {
                date,
                orders: found ? found.orders : 0,
            };
        });

        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.totalRevenue || 0,
            dailyOrdersData,
            orderStatusData
        }
    }
}

module.exports = OrderService