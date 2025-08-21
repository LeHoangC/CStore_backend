const orderModel = require('../models/order.model')
const PRODUCT_MODEL = require('../models/product.model')
const { getCountDocumentsByFilter } = require('../models/repositories/index.repo')
const { findAllProducts, getCountProductByFilter } = require('../models/repositories/product.repo')

class ProductService {
    static createProduct = async ({
        name,
        brand,
        category,
        description,
        mainImage,
        images = [],
        hasVariants,
        basePrice,
        stock,
        variantOptions,
        variants,
        isDraft = true,
        isPublished = false,
    }) => {
        if (hasVariants) {
            if (!variantOptions.length) {
            }

            basePrice = null
            stock = null
        } else {
            variantOptions = []
            variants = []
        }

        const newProduct = await PRODUCT_MODEL.create({
            name,
            brand,
            category,
            description,
            mainImage: mainImage ?? images[0],
            images,
            hasVariants,
            price: basePrice,
            stock,
            variantOptions,
            variants,
            isDraft,
            isPublished,
        })

        return newProduct
    }

    static updateProduct = async (productId, bodyUpdate) => {
        return await PRODUCT_MODEL.findByIdAndUpdate(productId, bodyUpdate, { new: true, runValidators: true })
    }

    static publicProduct = async (productId) => {
        const { modifiedCount } = await PRODUCT_MODEL.updateOne(
            {
                _id: productId,
            },
            {
                $set: {
                    isPublished: true,
                    isDraft: false,
                },
            }
        )

        return modifiedCount ? modifiedCount : null
    }

    static unPublicProduct = async (productId) => {
        const { modifiedCount } = await PRODUCT_MODEL.updateOne(
            {
                _id: productId,
            },
            {
                $set: {
                    isPublished: false,
                    isDraft: true,
                },
            }
        )

        return modifiedCount ? modifiedCount : null
    }

    static getProduct = async (slug) => {
        return await PRODUCT_MODEL.findOne({ slug }).populate({
            path: 'reviews',
            model: 'Review',
            populate: {
                path: 'review_user', // Populate thông tin user của từng review
                model: 'User',
                select: 'user_name' // Chỉ lấy trường name của user
            }
        })
    }

    static getAllProducts = async (query) => {
        return await findAllProducts({ ...query, filterObject: { isPublished: true, isDraft: false } })
    }

    static analyticProducts = async () => {
        const [totalProducts, totalProductDraft, totalLowStockProducts, categoryDistribution] = await Promise.all([
            getCountDocumentsByFilter(PRODUCT_MODEL),
            getCountDocumentsByFilter(PRODUCT_MODEL, { isDraft: true }),
            PRODUCT_MODEL.aggregate([
                // Bước 1: Thêm trường totalVariantStock để tính tổng stock của các variantOptions (nếu có)
                {
                    $addFields: {
                        totalVariantStock: {
                            $cond: {
                                if: { $eq: ["$hasVariants", true] },
                                then: { $sum: "$variants.stock" }, // Tính tổng stock của tất cả variantOptions
                                else: null, // Nếu không phải sản phẩm biến thể, để null
                            },
                        },
                    },
                },
                // Bước 2: Lọc các sản phẩm thỏa mãn điều kiện
                {
                    $match: {
                        $or: [
                            // Trường hợp 1: Sản phẩm thường có stock < 20
                            {
                                hasVariants: false,
                                stock: { $lt: 20 },
                            },
                            // Trường hợp 2: Sản phẩm có biến thể, tổng stock của các variantOptions < 20
                            {
                                hasVariants: true,
                                totalVariantStock: { $lt: 20 },
                            },
                        ],
                    },
                },
                // Bước 3: Đếm tổng số sản phẩm thỏa mãn điều kiện
                {
                    $count: "totalLowStockProducts",
                },
            ]),
            PRODUCT_MODEL.aggregate([
                // Bước 1: Tham gia (join) với collection categories để lấy tên danh mục
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "categoryInfo"
                    }
                },
                // Bước 2: Giải nén mảng categoryInfo (vì $lookup trả về mảng)
                {
                    $unwind: "$categoryInfo"
                },
                // Bước 3: Nhóm theo tên danh mục và tính tổng giá trị (hoặc số lượng)
                {
                    $group: {
                        _id: "$categoryInfo.name", // Nhóm theo tên danh mục
                        value: { $sum: 1 } // Đếm số lượng sản phẩm trong mỗi danh mục
                    }
                },
                {
                    $project: {
                        _id: 0,
                        name: "$_id",
                        value: 1
                    }
                },
                {
                    $sort: { value: -1 } // Sắp xếp giảm dần theo value
                }
            ]),
            // orderModel.aggregate([
            //     // Bước 1: Trích xuất tháng từ trường createdAt và định dạng thành tên tháng viết tắt
            //     {
            //         $project: {
            //             month: {
            //                 $dateToString: { format: "%b", date: "$createdAt" } // Sử dụng createdAt thay vì date
            //             },
            //             totalCheckout: "$order_checkout.totalCheckout" // Giữ lại trường amount để tính tổng
            //         }
            //     },
            //     // Bước 2: Nhóm theo tháng và tính tổng doanh thu
            //     {
            //         $group: {
            //             _id: "$month", // Nhóm theo tên tháng
            //             sales: { $sum: '$totalCheckout' } // Tính tổng doanh thu
            //         }
            //     },
            //     // Bước 3: Định dạng lại kết quả để khớp với cấu trúc mong muốn
            //     {
            //         $project: {
            //             _id: 0, // Ẩn trường _id
            //             month: "$_id", // Đặt tên tháng vào trường month
            //             sales: 1 // Giữ nguyên giá trị đã tính
            //         }
            //     },
            //     // Bước 4: Sắp xếp theo thứ tự tháng (nếu cần)
            //     {
            //         $sort: {
            //             month: 1 // Sắp xếp theo thứ tự bảng chữ cái (hoặc tùy chỉnh nếu cần)
            //         }
            //     }
            // ])
        ])

        return { totalProducts, totalProductDraft, totalLowStockProducts: totalLowStockProducts.length > 0 ? totalLowStockProducts[0].totalLowStockProducts : 0, categoryDistribution }
    }
}

module.exports = ProductService
