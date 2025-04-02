const express = require('express')
const asyncHandler = require('../../helpers/asyncHandle')
const orderController = require('../../controllers/order.controller')
const { authentication, checkAdmin } = require('../../auth/authUtils')
const router = express.Router()

router.use(authentication)

router.get('/orderByUser', asyncHandler(orderController.getOrdersByUser))
router.get('/orderByUser/:orderId', asyncHandler(orderController.getOrderByUser))

router.use(checkAdmin)

router.patch('/', asyncHandler(orderController.updateStatusOrder))
router.get('/', asyncHandler(orderController.getAllOrderByAdmin))

module.exports = router