
const NOTIFICATION_MODEL = require('../../models/notification.model')
const PRODUCT_MODEL = require('../../models/product.model')

const { getChannel } = require('../rabbitmq');
const { convertToObjectIdMongodb } = require('../../utils');

const moment = require('moment')
moment.locale('vi')

async function processOrders() {
    try {
        const channel = await getChannel();
        const queue = 'order_created';
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());

                // Tạo thông báo tới admin
                await NOTIFICATION_MODEL.create({
                    noti_type: "order_placed",
                    noti_senderId: orderData.order_user,
                    noti_receivedId: convertToObjectIdMongodb('67b7ee1ebac2c7d529cd72c7'),
                    noti_content: `Đơn hàng mới ${orderData.order_trackingNumber} được tạo lúc: ${moment(orderData?.createdAt).format('HH:mm DD/MM/YYYY')}`,
                    noti_options: { orderId: orderData._id },
                })

                // Tăng số lượng đã bán
                const quantityProduct = orderData.order_product.map(item => ({ productId: item.product._id, quantity: item.quantity }))

                await Promise.all(
                    quantityProduct.map(item =>
                        PRODUCT_MODEL.updateOne(
                            { _id: item.productId },
                            { $inc: { sold_quantity: item.quantity } }
                        )
                    )
                );

                channel.ack(msg);
            }
        }, { noAck: false });
    } catch (error) {
        console.error('[Consumer] Error:', error);
    }
}

module.exports = { processOrders };