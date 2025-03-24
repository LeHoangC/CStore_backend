const { getChannel } = require('../rabbitmq');

async function sendDiscountToQueue(discount) {
    try {
        const channel = await getChannel();
        const queue = 'discount_queue';
        await channel.assertQueue(queue, { durable: true });

        const message = Buffer.from(JSON.stringify({
            discount_code: discount.discount_code,
            discount_name: discount.discount_name,
            discount_value: discount.discount_value,
        }));
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    } catch (error) {
        console.error('[Producer] Error:', error);
    }
}

module.exports = { sendDiscountToQueue };