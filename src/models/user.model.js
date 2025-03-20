const { Schema, model } = require('mongoose')
const slugify = require('slugify')

const DOMCUMENT_NAME = 'User'
const COLLECTION_NAME = 'users'

const userSchema = new Schema(
    {
        user_name: { type: String, default: '' },
        user_email: { type: String, required: true },
        user_password: { type: String, default: '' },
        user_phone: { type: String, default: '' },
        user_sex: { type: String, default: '' },
        user_avatar: { type: String, default: '' },
        user_date_of_birth: { type: Date, default: null },
        // user_role: { type: Schema.Types.ObjectId, ref: 'Role' },
        user_role: { type: String, enum: ['admin', 'user'], default: 'user' },
        user_status: { type: String, default: 'active', enum: ['pending', 'active', 'block'] },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

userSchema.index({ user_name: "text", user_email: "text" });

module.exports = model(DOMCUMENT_NAME, userSchema)
