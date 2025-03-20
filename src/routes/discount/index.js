const express = require('express');
const { authentication, checkAdmin } = require('../../auth/authUtils');
const asyncHandler = require('../../helpers/asyncHandle');
const { createDiscount, updateDiscount, getDiscount, verifyDiscount, getAllDiscount, deleteDiscount } = require('../../controllers/discount.controller');
const router = express.Router();

router.get('/', asyncHandler(getAllDiscount))
router.get('/:discountId', asyncHandler(getDiscount))

router.use(authentication)

router.post('/verify', asyncHandler(verifyDiscount))

router.use(checkAdmin)

router.post('/', asyncHandler(createDiscount))
router.patch('/:discountId', asyncHandler(updateDiscount))

router.delete('/:discountId', asyncHandler(deleteDiscount))

module.exports = router;