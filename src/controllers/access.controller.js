const AccessService = require('../services/access.service')

class AccessController {
    signup = async (req, res, next) => {
        return res.status(201).json(await AccessService.signup(req.body))
    }

    login = async (req, res, next) => {
        return res.status(200).json(await AccessService.login(req.body))
    }

    logout = async (req, res, next) => {
        return res.status(200).json(await AccessService.logout(req.keyStore))
    }

    refreshToken = async (req, res, next) => {
        return res.status(200).json(await AccessService.refreshToken({ keyStore: req.keyStore, user: req.user, refreshToken: req.refreshToken }))
    }
}

module.exports = new AccessController()