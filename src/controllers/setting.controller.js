const SettingsService = require("../services/settings.service")

class SettingController {

    getSettings = async (req, res) => {
        return res.status(200).json(await SettingsService.getSettings())
    }

    getBanners = async (req, res) => {
        return res.status(200).json(await SettingsService.getBanners())
    }

    updateBanner = async (req, res) => {
        return res.status(201).json(await SettingsService.updateBanner({ banners: req.body.banners }))
    }
}


module.exports = new SettingController()