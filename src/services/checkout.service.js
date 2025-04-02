
const ErrorResponse = require('../core/error.response')
const CART_MODEL = require('../models/cart.model')
const ORDER_MODEL = require('../models/order.model')
const { validateProductsExistInCart, getCart } = require('../models/repositories/cart.repo')
const { checkDiscountExist, getApplicableProducts } = require('../models/repositories/discount.repo')
const { generateRandomCode } = require('../models/repositories/order.repo')
const { checkProductByServer } = require('../models/repositories/product.repo')
const { sendOrderToQueue } = require('../queues/producers/orderProducer')
const { convertToObjectIdMongodb } = require('../utils')
const DiscountService = require('./discount.service')
const { acquireVariantLock, acquireProductLock, releaseLock } = require('./redis.service')

class CheckoutService {
    static checkoutReview = async ({ cartId, userId, products, discountId = null }) => {

        const foundCart = await getCart({ _id: cartId, cart_userId: userId, cart_state: 'active' })
        if (!foundCart) {
            throw new ErrorResponse('Giỏ hàng không tồn tại.')
        }

        validateProductsExistInCart(products, foundCart.cart_products)

        const checkoutOrder = {
            totalPrice: 0,
            feeShip: 0,
            totalCheckout: 0,
            discount: 0
        }

        if (discountId) {
            const foundDiscount = await checkDiscountExist({ _id: discountId })

            if (foundDiscount) {
                const verifyDiscount = await DiscountService.verifyDiscount({ discountCode: foundDiscount.discount_code, userId, products, cartId })
                checkoutOrder.discount = verifyDiscount.discount.amount
            }
        }

        const checkProductServer = await checkProductByServer(products)

        const checkoutPrice = checkProductServer.reduce((acc, { product, quantity }) => {
            if (product.hasVariants) {
                acc += product.variants[0].price * quantity
            } else {
                acc += product.price * quantity
            }

            return acc
        }, 0)

        checkoutOrder.totalPrice = checkoutPrice - checkoutOrder.discount
        checkoutOrder.totalCheckout = checkoutPrice

        return { checkoutOrder, products: checkProductServer }
    }

    static orderByUser = async ({ userId, cartId, orderProducts, userAddress, userPayment, discountId = null }) => {
        const { checkoutOrder, products } = await this.checkoutReview({ cartId, userId, products: orderProducts, discountId })

        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const { product, quantity } = products[i]

            let keyLock
            if (product.hasVariants) {
                keyLock = await acquireVariantLock({ productId: product._id, variantId: product.variants[0]._id, quantity })
            } else {
                keyLock = await acquireProductLock({ productId: product._id, quantity })
            }

            acquireProduct.push(keyLock ? true : false)

            if (keyLock) {
                await releaseLock(keyLock)
            }
        }

        if (acquireProduct.includes(false)) {
            throw new ErrorResponse('Một số sản phẩm đã được cập nhật, vui lòng quay lại giỏ hàng')
        }

        const newOrder = await ORDER_MODEL.create({
            order_user: convertToObjectIdMongodb(userId),
            order_checkout: checkoutOrder,
            order_shipping: userAddress,
            order_payment: userPayment,
            order_product: products,
            order_trackingNumber: generateRandomCode()
        })

        if (!newOrder) {
            throw new ErrorResponse('Hệ thống lỗi')
        }


        // send mail
        // tích điểm...

        await sendOrderToQueue(newOrder)

        for (const item of products) {
            await CART_MODEL.updateOne(
                { _id: cartId },
                {
                    $pull: {
                        cart_products: {
                            productId: item.product._id.toString(),
                            variantId: item.product.hasVariants ? item.product.variants[0]._id.toString() : null
                        }
                    },
                    $inc: { cart_count_product: -1 }
                }
            );
        }
        return newOrder
    }

}

module.exports = CheckoutService