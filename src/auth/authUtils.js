const jwt = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandle');
const KeyTokenService = require('../services/keyToken.service');
const ErrorResponse = require('../core/error.response');

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-rtoken-id',
}

const createTokensPair = async (payload, publicKey, privateKey) => {
    try {
        const accessToken = jwt.sign(payload, publicKey, { expiresIn: '1d' });
        const refreshToken = jwt.sign(payload, privateKey, { expiresIn: '2d' });

        return { accessToken, refreshToken };
    } catch (error) {

    }
}

const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID];

    if (!userId) {
        throw new ErrorResponse('Unauthorized. Not found x-client-id', 401);
    }

    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) {
        throw new ErrorResponse('Unauthorized. Not found key store', 401);
    }

    if (req.headers[HEADER.REFRESHTOKEN]) {
        const refreshToken = req.headers[HEADER.REFRESHTOKEN];
        const decodeUser = jwt.verify(refreshToken, keyStore.privateKey);

        if (decodeUser.userId !== userId) {
            throw new ErrorResponse('Unauthorized. Invalid refresh token', 401);
        }

        req.keyStore = keyStore
        req.user = decodeUser
        req.refreshToken = refreshToken

        return next()
    }

    const accessToken = req.headers[HEADER.AUTHORIZATION]

    if (!accessToken) {
        throw new ErrorResponse('Unauthorized. Not found access token', 401);
    }

    const decodeUser = jwt.verify(accessToken, keyStore.publicKey);

    if (userId !== decodeUser.userId) {
        throw new ErrorResponse('Unauthorized. Invalid access token', 401);
    }

    req.keyStore = keyStore;
    req.user = decodeUser;

    next();
})

const checkAdmin = asyncHandler(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        throw new ErrorResponse("Unauthorized. You don't have permission to access this resource", 403);
    }
    next();
})

module.exports = {
    createTokensPair,
    authentication,
    checkAdmin
}