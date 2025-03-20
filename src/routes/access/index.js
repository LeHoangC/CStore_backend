const express = require('express')
const { signup, login, logout, refreshToken } = require('../../controllers/access.controller')
const asyncHandler = require('../../helpers/asyncHandle')
const { authentication } = require('../../auth/authUtils')

const router = express.Router()

router.post('/signup', asyncHandler(signup))
router.post('/login', asyncHandler(login))

router.use(authentication)

router.post('/logout', asyncHandler(logout))
router.post('/refreshToken', asyncHandler(refreshToken))

module.exports = router
