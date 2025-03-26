const PRODUCT_MODEL = require('../../models/product.model')

const { getChannel } = require("../rabbitmq");

async function processSoldQuantityFromQueue() {
    try {
        const channel = await getChannel();
        const queue = 'sold_quantity_queue';
        await channel.assertQueue(queue, { durable: true });

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const orderData = JSON.parse(msg.content.toString());
                await Promise.all(
                    orderData.map(item =>
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

module.exports = { processSoldQuantityFromQueue };