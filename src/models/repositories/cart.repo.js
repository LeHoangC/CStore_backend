const ErrorResponse = require('../../core/error.response')
const CART_MODEL = require('../../models/cart.model')

const validateProductsExistInCart = (checkoutProducts, cartProducts) => {
    for (const checkoutProduct of checkoutProducts) {
        const { productId, variantId, name } = checkoutProduct
        const cartProduct = cartProducts.find(product => product.productId === productId && product.variantId === variantId)

        if (!cartProduct) {
            throw new ErrorResponse(`Sản phẩm '${name}' không tồn tại trong giỏ hàng của bạn.`, 400)
        }
    }
}

const getCart = async (filter) => {
    return await CART_MODEL.findOne(filter)
}

module.exports = {
    getCart,
    validateProductsExistInCart
}