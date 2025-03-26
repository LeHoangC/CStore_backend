const mongoose = require('mongoose')

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'orders'

var orderSchema = new mongoose.Schema(
    {
        order_user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        order_checkout: {
            type: Object,
            default: {},
        },
        order_shipping: {
            type: Object,
            default: {},
        },
        order_payment: {
            type: Object,
            default: {},
        },
        order_product: {
            type: Array,
            required: true,
            default: [],
        },
        order_trackingNumber: {
            type: String,
            required: true,
        },
        order_status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

orderSchema.index({ order_trackingNumber: 1 });


//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, orderSchema)
