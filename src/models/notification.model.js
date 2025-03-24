const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Notification'
const COLLECTION_NAME = 'notifications'

const notificationSchema = new Schema(
    {
        noti_type: {
            type: String,
            enum: ['order_placed', 'order_confirmed', 'order_delivered', 'discount_created'],
            required: true,
        },
        noti_senderId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        noti_receivedId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        noti_content: {
            type: String,
            required: true,
        },
        noti_is_read: {
            type: Boolean,
            default: false
        },
        noti_options: {
            type: Object,
            default: {},
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

module.exports = model(DOCUMENT_NAME, notificationSchema)