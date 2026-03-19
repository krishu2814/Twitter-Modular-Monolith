const NotificationRepository = require('./notification-repository');

class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    async createNotification(data) {
        return await this.notificationRepository.createNotification(data);
    }

    async getNotifications(userId) {
        return await this.notificationRepository.getNotifications(userId);
    }

    async markRead(notificationId) {
        return await this.notificationRepository.markRead(notificationId);
    }

    async markAllRead(userId) {
        await this.notificationRepository.markAllRead(userId);
    }
}

module.exports = NotificationService;
