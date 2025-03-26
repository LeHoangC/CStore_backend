const crypto = require('node:crypto');
const USER_MODEL = require('../models/user.model');
const bcrypt = require('bcryptjs');
const { createTokensPair } = require('../auth/authUtils');
const KeyTokenService = require('./keyToken.service');
const ErrorResponse = require('../core/error.response');
const keytokenModel = require('../models/keyToken.model');

class AccessSevice {
    static signup = async ({ name, email, password }) => {
        const holderUser = await USER_MODEL.findOne({ user_email: email });

        if (holderUser) {
            throw new ErrorResponse('Email đã được đăng ký!', 400);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await USER_MODEL.create({
            user_name: name,
            user_email: email,
            user_password: passwordHash,
        })

        if (newUser) {
            const publicKey = crypto.randomBytes(64).toString('hex');
            const privateKey = crypto.randomBytes(64).toString('hex');

            const tokens = await createTokensPair({ userId: newUser._id, role: newUser.user_role }, publicKey, privateKey);

            const publicKeyString = await KeyTokenService.createKeyToken({
                userId: newUser._id,
                publicKey,
                privateKey,
                refreshToken: tokens.refreshToken,
            })

            if (!publicKeyString) {
                throw new ErrorResponse('Error when create key token!', 500);
            }

            return {
                user: newUser,
                tokens
            }
        }
    }


    static login = async ({ email, password }) => {
        const foundUser = await USER_MODEL.findOne({ user_email: email });

        if (!foundUser) {
            throw new ErrorResponse('Người dùng không tồn tại!', 404);
        }

        const isPasswordMatch = await bcrypt.compare(password, foundUser.user_password);

        if (!isPasswordMatch) {
            throw new ErrorResponse('Password not match!', 400);
        }

        const publicKey = crypto.randomBytes(64).toString('hex');
        const privateKey = crypto.randomBytes(64).toString('hex');

        const tokens = await createTokensPair({ userId: foundUser._id, role: foundUser.user_role }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId: foundUser._id,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey,
        })

        return {
            user: foundUser,
            tokens
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        return delKey
    }

    static refreshToken = async ({ user, keyStore, refreshToken }) => {
        const { userId, role } = user

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.removeKeyById(keyStore._id)
            throw new ErrorResponse('Refresh token is revoked! Please relogin', 403)
        }

        if (keyStore.refreshToken !== refreshToken) {
            throw new ErrorResponse('Refresh token is invalid!', 401)
        }

        const tokens = await createTokensPair({ userId, role }, keyStore.publicKey, keyStore.privateKey)
        await keytokenModel.updateOne(
            { _id: keyStore._id },
            {
                $set: {
                    refreshToken: tokens.refreshToken
                },
                $addToSet: {
                    refreshTokensUsed: refreshToken
                }
            }
        )

        return {
            user,
            tokens,
        }
    }
}

module.exports = AccessSevice