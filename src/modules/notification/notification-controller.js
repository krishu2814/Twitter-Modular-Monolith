const NotificationService = require('./notification-service');

class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
    }

    async getNotifications(req, res) {
        try {
            const userId = req.user._id;
            const notifications = await this.notificationService.getNotifications(userId);
            res.status(200).json({
                status: "success",
                message: "Notifications fetched",
                data: notifications,
                err: {}
            });
        } catch (err) {
            console.error('❌ Error fetching notifications:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
        }
    }

    async markRead(req, res) {
        try {
            const notificationId = req.params.id;
            const updatedNotification = await this.notificationService.markRead(notificationId);
            res.status(200).json({ success: true, notification: updatedNotification });
        } catch (err) {
            console.error('❌ Error marking notification as read:', err);
            res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
        }
    }

    async markAllRead(req, res) {
        try {
            const userId = req.user._id;
            await this.notificationService.markAllRead(userId);
            res.status(200).json({ success: true, message: 'All notifications marked as read' });
        } catch (err) {
            console.error('❌ Error marking all notifications as read:', err);
            res.status(500).json({ success: false, message: 'Failed to mark all notifications as read' });
        }
    }
}

module.exports = NotificationController;
