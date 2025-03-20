const OrderService = require("../services/order.service")

class OrderController {

    getOrdersByUser = async (req, res, next) => {
        return res.status(200).json(await OrderService.getOrdersByUser(req.user.userId))
    }

    getOrderByUser = async (req, res, next) => {
        return res.status(200).json(await OrderService.getOrderByUser(req.params.orderId))
    }

    getAllOrderByAdmin = async (req, res, next) => {
        return res.status(200).json(await OrderService.getAllOrderByAdmin(req.query))
    }

    analyticOrder = async (req, res, next) => {
        return res.status(200).json(await OrderService.analyticOrder())
    }
}

module.exports = new OrderController()