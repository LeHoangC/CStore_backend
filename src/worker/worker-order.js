require('../dbs/init.mongodb')

const { processOrders } = require('../queues/consumers/orderConsumer');

processOrders()