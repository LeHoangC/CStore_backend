const express = require('express')
const { authentication, checkAdmin } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const { analyticProducts } = require('../../controllers/product.controller')
const { analyticOrder } = require('../../controllers/order.controller')

const router = express.Router()

router.get('/orders', asyncHandler(analyticOrder))
router.use(authentication)
router.use(checkAdmin)

router.get('/products', asyncHandler(analyticProducts))

module.exports = router