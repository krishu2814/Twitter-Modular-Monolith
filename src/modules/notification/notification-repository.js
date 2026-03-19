const Notification = require('./notification-model');

class NotificationRepository {
    async createNotification(data, session) {
        return await Notification.create([data], { session });
    }

    async delete(id, session = null) {
        return await Notification.findByIdAndDelete(id, { session });
    }

    async getNotifications(userId) {
        return await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('actor', 'userName profileImage').lean();
    }

    async markRead(notificationId) {
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }

    async markAllRead(userId) {
        await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    }
}

module.exports = NotificationRepository;
