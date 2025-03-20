const express = require('express')
const { authentication } = require('../../auth/authUtils')
const CheckoutController = require('../../controllers/checkout.controller')
const asyncHandler = require('../../helpers/asyncHandle')

const router = express.Router()

router.use(authentication)

router.post('/review', asyncHandler(CheckoutController.checkoutReview))
router.post('/order', asyncHandler(CheckoutController.orderByUser))

module.exports = router