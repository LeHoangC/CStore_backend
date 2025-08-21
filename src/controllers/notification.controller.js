const NotificationService = require("../services/notification.service");

class NotificationController {
    getNotificationsByAdmin = async (req, res) => {
        return res.status(200).json(await NotificationService.getNotiByAdmin())
    }

    markAsRead = async (req, res) => {
        const { notiId } = req.params
        const notification = await NotificationService.markAsRead(notiId)
        return res.status(200).json(notification)
    }
}

module.exports = new NotificationController();