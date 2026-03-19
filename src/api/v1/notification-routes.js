const express = require('express');
const NotificationController = require('./notification-controller');
const authentication = require('../../middleware/auth');

const router = express.Router();
const notificationController = new NotificationController();

router.get('/', authentication, notificationController.getNotifications.bind(notificationController));
router.post('/:id/read', authentication, notificationController.markRead.bind(notificationController));
router.post('/mark-all-read', authentication, notificationController.markAllRead.bind(notificationController));

module.exports = router;
