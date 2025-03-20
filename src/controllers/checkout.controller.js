const CheckoutService = require("../services/checkout.service")

class CheckoutController {
    static checkoutReview = async (req, res, next) => {
        return res.status(200).json(await CheckoutService.checkoutReview({ userId: req.user.userId, ...req.body }))
    }

    static orderByUser = async (req, res, next) => {
        return res.status(200).json(await CheckoutService.orderByUser({ userId: req.user.userId, ...req.body }))
    }
}

module.exports = CheckoutController