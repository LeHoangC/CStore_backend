const express = require('express')
const { authentication, checkAdmin } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const { getAllUser } = require('../../controllers/user.controller')

const router = express.Router()

router.use(authentication)
router.use(checkAdmin)

router.get('/', asyncHandler(getAllUser))

module.exports = router