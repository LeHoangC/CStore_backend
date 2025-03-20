const express = require('express')
const { authentication, checkAdmin } = require('../../auth/authUtils')
const { createProduct, updateProduct, publicProduct, unPublicProduct, getProduct, getAllProducts, analyticProducts } = require('../../controllers/product.controller')
const asyncHandler = require('../../helpers/asyncHandle')

const router = express.Router()

router.get('/', asyncHandler(getAllProducts))
router.get('/:slug', asyncHandler(getProduct))

router.use(authentication)
router.use(checkAdmin)

router.get('/analytic_products', asyncHandler(analyticProducts))

router.post('/', asyncHandler(createProduct))
router.patch('/:productId', asyncHandler(updateProduct))

router.post('/publish/:productId', asyncHandler(publicProduct))
router.post('/unpublish/:productId', asyncHandler(unPublicProduct))

module.exports = router