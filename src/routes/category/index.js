const express = require('express')
const asyncHandler = require('../../helpers/asyncHandle')
const { createCategory, updateCategory, getCategories, getCategoryById, deleteCategory } = require('../../controllers/category.controller')
const { authentication, checkAdmin } = require('../../auth/authUtils')
const router = express.Router()

router.get('/', asyncHandler(getCategories))

router.use(authentication)
router.use(checkAdmin)

router.get('/:id', asyncHandler(getCategoryById))
router.post('/', asyncHandler(createCategory))
router.patch('/:categoryId', asyncHandler(updateCategory))
router.delete('/:categoryId', asyncHandler(deleteCategory))

module.exports = router