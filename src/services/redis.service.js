const Redis = require('ioredis');
const PRODUCT_MODEL = require('../models/product.model');
const redis = new Redis()

redis.on('connect', () => {
    console.log('Redis connected');
})

const acquireProductLock = async ({ productId, quantity, lockTimeoutSeconds = 10 }) => {
    const lockKey = `product_lock:${productId}`
    const retryTimes = 10

    for (let i = 0; i < retryTimes; i++) {
        const result = await redis.set(lockKey, 'locked', 'NX', 'EX', lockTimeoutSeconds);

        if (result === 'OK') {
            const updated = await PRODUCT_MODEL.findOneAndUpdate(
                {
                    _id: productId,
                    stock: { $gte: quantity }
                },
                {
                    $inc: {
                        stock: -quantity
                    }
                }
            )
            return updated ? lockKey : null;
        } else {
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }
}

const acquireVariantLock = async ({ productId, variantId, quantity, lockTimeoutSeconds = 10 }) => {
    const lockKey = `product_lock:${productId}:variant:${variantId}`
    const retryTimes = 10

    for (let i = 0; i < retryTimes; i++) {
        const result = await redis.set(lockKey, 'locked', 'NX', 'EX', lockTimeoutSeconds);
        if (result === 'OK') {
            const updated = await PRODUCT_MODEL.findOneAndUpdate(
                {
                    _id: productId,
                    variants: {
                        $elemMatch: {
                            _id: variantId,
                            stock: { $gte: quantity }
                        }
                    }
                },
                {
                    $inc: {
                        'variants.$.stock': -quantity
                    }
                }
            )

            return updated ? lockKey : null;
        } else {
            await new Promise(resolve => setTimeout(resolve, 50))
        }
    }
}

const releaseLock = async (keyLock) => {
    return await redis.del(keyLock)
}

module.exports = {
    acquireProductLock,
    acquireVariantLock,
    releaseLock
}