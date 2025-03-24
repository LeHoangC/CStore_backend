const { Schema, model, Types } = require('mongoose')

const DOCUMENT_NAME = 'Otp'
const COLLECTION_NAME = 'otps'

const otpSchema = new Schema(
    {
        otp_token: { type: String, required: true },
        otp_email: { type: String, required: true },
        otp_status: { type: String, default: 'pending', enum: ['pending', 'active', 'block'] },
        time: {
            type: Date, default: Date.now, index: { expires: 60 }
        }
    },
    {
        collection: COLLECTION_NAME,
    }
)

module.exports = model(DOCUMENT_NAME, otpSchema)
