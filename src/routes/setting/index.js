const express = require('express')
const { authentication, checkAdmin } = require('../../auth/authUtils')
const asyncHandler = require('../../helpers/asyncHandle')
const { updateBanner, getBanners, getSettings } = require('../../controllers/setting.controller')

const router = express.Router()


router.get('/', asyncHandler(getSettings))
router.get('/banners', asyncHandler(getBanners))

router.use(authentication)
router.use(checkAdmin)

router.post('/update-banners', asyncHandler(updateBanner))

module.exports = router