const Redis = require('ioredis')
const redis = new Redis()

redis.on('connect', () => {
    console.log("Connect redis success");
})

module.exports = redis