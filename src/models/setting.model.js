const { Schema, model } = require('mongoose')

const DOMCUMENT_NAME = 'Setting'
const COLLECTION_NAME = 'settings'

const settingSchema = new Schema(
    {
        setting_banners: { type: Array, default: [], },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

module.exports = model(DOMCUMENT_NAME, settingSchema)
