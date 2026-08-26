const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const MessageController = require('../../modules/message/message-controller');
const messageController = new MessageController();

// Send direct message: POST /api/v1/messages/send
router.post('/send', authentication, messageController.sendMessage.bind(messageController));

// List conversations: GET /api/v1/messages/conversations
router.get('/conversations', authentication, messageController.getConversations.bind(messageController));

// Get chat history with user: GET /api/v1/messages/conversation/:userId
router.get('/conversation/:userId', authentication, messageController.getConversation.bind(messageController));

// Mark message as read: PATCH /api/v1/messages/:messageId/read
router.patch('/:messageId/read', authentication, messageController.markAsRead.bind(messageController));

module.exports = router;
