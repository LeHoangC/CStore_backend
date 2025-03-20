const express = require('express');
const asyncHandler = require('../../helpers/asyncHandle');
const { newResource, newRole } = require('../../controllers/rbac.controller');

const router = express.Router();

router.post('/resource', asyncHandler(newResource));

router.post('/role', asyncHandler(newRole));

module.exports = router;