require('../dbs/init.mongodb')

const { processDiscounts } = require('../queues/consumers/discountConsumer');

processDiscounts()