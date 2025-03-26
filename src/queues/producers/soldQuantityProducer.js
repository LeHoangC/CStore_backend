const { getChannel } = require("../rabbitmq");

async function sendSoldQuantityToQueue(soldData) {
    try {
        const channel = await getChannel();
        const queue = 'sold_quantity_queue';
        await channel.assertQueue(queue, { durable: true });

        const message = JSON.stringify(soldData);
        channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    } catch (error) {
        console.error('[Producer] Error:', error);
    }
}

module.exports = { sendSoldQuantityToQueue };