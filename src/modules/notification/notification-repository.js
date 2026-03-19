const Notification = require('./notification-model');

class NotificationRepository {
    async createNotification(data, session) {
        return await Notification.create([data], { session });
    }

    async delete(id, session = null) {
        return await Notification.findByIdAndDelete(id, { session });
    }

    async getNotifications(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ user: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('actor', 'userName profileImage')
                .lean(),

            Notification.countDocuments({ user: userId })
        ]);

        return {
            notifications,
            total
        };
    }

    async markRead(notificationId) {
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }

    async markAllRead(userId) {
        await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    }
}

module.exports = NotificationRepository;
