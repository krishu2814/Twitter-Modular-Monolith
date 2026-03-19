const NotificationRepository = require('./notification-repository');

class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    async createNotification(data) {
        return await this.notificationRepository.createNotification(data);
    }

    async getNotifications(userId, page, limit) {
        const { notifications, total } = await this.notificationRepository.getNotifications(userId, page, limit);

        return {
            notifications,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async markRead(notificationId) {
        return await this.notificationRepository.markRead(notificationId);
    }

    async markAllRead(userId) {
        await this.notificationRepository.markAllRead(userId);
    }
}

module.exports = NotificationService;
