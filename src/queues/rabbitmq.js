const amqp = require('amqplib');

let connection;
let channel;

async function connectRabbitMQ() {
    if (channel) return channel;

    try {
        connection = await amqp.connect('amqp://localhost:5672');
        channel = await connection.createChannel();
        console.log('[RabbitMQ] Connected');

        connection.on('close', () => {
            console.error('[RabbitMQ] Connection closed, reconnecting...');
            channel = null;
            setTimeout(connectRabbitMQ, 1000);
        });

        return channel;
    } catch (error) {
        console.error('[RabbitMQ] Error:', error);
        setTimeout(connectRabbitMQ, 1000);
    }
}

async function getChannel() {
    if (!channel) await connectRabbitMQ();
    return channel;
}

module.exports = { getChannel };