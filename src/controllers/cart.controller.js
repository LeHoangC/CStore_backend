const CartService = require("../services/cart.service")
const { removeUndefinedObject } = require("../utils")

class CartController {
    static getUserCart = async (req, res, next) => {
        return res.status(200).json(await CartService.getUserCart(req.user.userId))
    }

    static addToCart = async (req, res, next) => {
        return res.status(200).json(await CartService.addToCart({ userId: req.user.userId, product: removeUndefinedObject(req.body.product) }))
    }

    static updateUserCartQuantity = async (req, res, next) => {
        return res.status(200).json(await CartService.updateUserCartQuantity({ userId: req.user.userId, product: req.body.product }))
    }

    static removeItemCart = async (req, res, next) => {
        return res.status(200).json(await CartService.removeItemCart({ userId: req.user.userId, ...req.body }))
    }

    static resetCart = async (req, res, next) => {
        return res.status(200).json(await CartService.resetCart({ userId: req.user.userId, cartId: req.params.cartId }))
    }
}

module.exports = CartController