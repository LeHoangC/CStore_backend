require('../dbs/init.mongodb')

const { processSoldQuantityFromQueue } = require('../queues/consumers/soldQuantityConsumer');

processSoldQuantityFromQueue()