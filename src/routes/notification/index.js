const express = require('express');
const { authentication, checkAdmin } = require('../../auth/authUtils');
const asyncHandler = require('../../helpers/asyncHandle');
const { getNotificationsByAdmin, markAsRead } = require('../../controllers/notification.controller');
const router = express.Router();

router.use(authentication)
router.use(checkAdmin)

router.get('/', asyncHandler(getNotificationsByAdmin))
router.patch('/:notiId', asyncHandler(markAsRead))

module.exports = router;