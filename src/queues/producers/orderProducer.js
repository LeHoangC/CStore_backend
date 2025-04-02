const { getChannel } = require('../rabbitmq');

async function sendOrderToQueue(orderData) {
    try {
        const channel = await getChannel();
        const queue = 'order_created';
        await channel.assertQueue(queue, { durable: true });

        const message = JSON.stringify(orderData);
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    } catch (error) {
        console.error('[Producer] Error:', error);
    }
}

module.exports = { sendOrderToQueue };