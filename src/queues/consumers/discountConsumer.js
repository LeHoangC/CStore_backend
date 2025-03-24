const USER_MODEL = require('../../models/user.model')
const NOTIFICATION_MODEL = require('../../models/notification.model')

const { getChannel } = require('../rabbitmq');
const { default: mongoose } = require('mongoose');

async function processDiscounts() {
    try {
        const channel = await getChannel();
        const queue = 'discount_queue';
        await channel.assertQueue(queue, { durable: true });

        console.log('[Consumer] Waiting for discounts...');

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const discount = JSON.parse(msg.content.toString());
                const users = await USER_MODEL.find({ user_role: 'user' });
                const senderId = new mongoose.Types.ObjectId();

                const notifications = users.map(user => ({
                    noti_type: 'discount_created',
                    noti_senderId: senderId,
                    noti_receivedId: user._id,
                    noti_content: `Mã giảm giá mới: ${discount.discount_code} - Giảm ${discount.discount_value}%`,
                    noti_is_read: false,
                    noti_options: { discount_code: discount.discount_code },
                }));

                await NOTIFICATION_MODEL.insertMany(notifications);

                channel.ack(msg);
            }
        }, { noAck: false });
    } catch (error) {
        console.error('[Consumer] Error:', error);
    }
}

module.exports = { processDiscounts };