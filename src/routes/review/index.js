const express = require('express')
const { authentication } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const { createReview } = require('../../controllers/review.controller')

const router = express.Router()

router.use(authentication)

router.post('/', asyncHandler(createReview))

module.exports = router