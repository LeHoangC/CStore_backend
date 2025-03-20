const express = require('express')
const { authentication } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const CartController = require('../../controllers/cart.controller')

const router = express.Router()

router.use(authentication)

router.get('/', asyncHandler(CartController.getUserCart))
router.post('/', asyncHandler(CartController.addToCart))
router.post('/update', asyncHandler(CartController.updateUserCartQuantity))
router.patch('/remove-item-cart', asyncHandler(CartController.removeItemCart))
router.delete('/:cartId', asyncHandler(CartController.resetCart))

module.exports = router