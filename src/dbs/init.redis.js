const Redis = require('ioredis');
const ErrorResponse = require('../core/error.response');

let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECT: 'reconnecting',
    ERROR: 'error',
},
    connectionTimeout

const REDIS_CONNECT_TIMEOUT = 10 * 1000, REDIS_CONNECT_MESSAGE = {
    code: -99,
    message: {
        vn: 'Redis lỗi rồi hotfix, hotfix!!!',
        en: 'Service redis connect error',
    },
}

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new ErrorResponse(REDIS_CONNECT_MESSAGE.message.vn, 500)
    }, REDIS_CONNECT_TIMEOUT);
}

const handleEventConnection = (connectionRedis) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`ConnectionIoRedis - Connection Status: Connected`);
        // clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`ConnectionIoRedis - Connection Status: END`);
        // handleTimeoutError()
        throw new ErrorResponse(REDIS_CONNECT_MESSAGE.message.vn, 500)
    })

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`ConnectionIoRedis - Connection Status: RECONNECT`);
        // clearTimeout(connectionTimeout)
    })

    connectionRedis.on(statusConnectRedis.ERROR, () => {
        console.log(`ConnectionIoRedis - Connection Status: ERROR`);
        // handleTimeoutError()
        throw new ErrorResponse(REDIS_CONNECT_MESSAGE.message.vn, 500)
    })
}

const initRedis = ({ IS_ENABALED, HOST = process.env.URL_REDIS, PORT = 6379 }) => {
    if (IS_ENABALED) {
        const instanceRedis = new Redis()

        client.instanceConnect = instanceRedis
        handleEventConnection(instanceRedis)
    }
}

const getRedis = () => client

const closeRedis = async () => await client.instanceConnect.quit()

module.exports = { initRedis, getRedis, closeRedis }