const { Schema, model, default: mongoose } = require('mongoose')

const DOMCUMENT_NAME = 'Review'
const COLLECTION_NAME = 'reviews'

const reviewSchema = new Schema(
    {
        review_user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        review_order: {
            type: mongoose.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        review_images: {
            type: Array,
            default: []
        },
        review_text: {
            type: String,
            default: ''
        },
        review_rating: {
            type: Number,
            default: 5
        }
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

module.exports = model(DOMCUMENT_NAME, reviewSchema)
