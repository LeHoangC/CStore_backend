const NOTIFICATION = require("../models/notification.model")
const { getCountDocumentsByFilter } = require("../models/repositories/index.repo")

class NotificationService {
    static getNotiByAdmin = async () => {
        const [numUnRead, notifications] = await Promise.all([
            getCountDocumentsByFilter(NOTIFICATION, { noti_is_read: false }),
            NOTIFICATION.find({ noti_type: 'order_placed' }).sort({ createdAt: -1 }).lean()
        ])

        return { numUnRead, notifications }
    }

    static markAsRead = async (notiId) => {
        const notification = await NOTIFICATION.findByIdAndUpdate(notiId, { noti_is_read: true }, { new: true })
        return notification
    }
}

module.exports = NotificationService