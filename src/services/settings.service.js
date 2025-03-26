const SETTING_MODEL = require("../models/setting.model")

class SettingsService {

    static getSettings = async () => {
        const setting = await SETTING_MODEL.find()
        return setting[0]
    }

    static getBanners = async () => {
        const setting = await SETTING_MODEL.find()
        return { banners: setting[0].setting_banners }
    }

    static updateBanner = async ({ banners }) => {
        await SETTING_MODEL.findOneAndUpdate({}, { setting_banners: banners }, { upsert: true, new: true })
    }
}

module.exports = SettingsService