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
        review_productId: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        review_variantId: {
            type: mongoose.Types.ObjectId,
            required: false,
        },
        review_variant_name: {
            type: String,
        },
        review_images: {
            type: Array,
            default: []
        },
        review_text: {
            type: String,
            default: ''
        },
        rating: {
            type: Number,
            required: true,
            min: [1, "Điểm đánh giá phải từ 1 đến 5"],
            max: [5, "Điểm đánh giá phải từ 1 đến 5"],
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

module.exports = model(DOMCUMENT_NAME, reviewSchema)
