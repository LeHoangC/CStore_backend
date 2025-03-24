
const NOTIFICATION_MODEL = require('../../models/notification.model')
const { getChannel } = require('../rabbitmq');
const { convertToObjectIdMongodb } = require('../../utils');

const moment = require('moment')
moment.locale('vi')


async function processOrders() {
    try {
        const channel = await getChannel();
        const queue = 'order_notifications';
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                await NOTIFICATION_MODEL.create({
                    noti_type: "order_placed",
                    noti_senderId: orderData.customerId,
                    noti_receivedId: convertToObjectIdMongodb('67b7ee1ebac2c7d529cd72c7'),
                    noti_content: `Đơn hàng mới ${orderData.trackingId} được tạo lúc: ${moment(orderData?.createdAt).format('HH:mm DD/MM/YYYY')}`
                })

                channel.ack(msg);
            }
        }, { noAck: false });
    } catch (error) {
        console.error('[Consumer] Error:', error);
    }
}

module.exports = { processOrders };