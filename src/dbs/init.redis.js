const Redis = require('ioredis')
const redis = new Redis(process.env.URL_REDIS);
redis.on('connect', () => {
    console.log("Connect redis success");
})

module.exports = redis