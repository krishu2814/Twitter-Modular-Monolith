const MessageService = require('./message-service');

class MessageController {
    constructor() {
        this.messageService = new MessageService();
    }

    // POST /api/v1/messages/send
    async sendMessage(req, res) {
        try {
            const senderId = req.user._id;
            const { receiverId, content } = req.body;

            const response = await this.messageService.sendMessage(senderId, receiverId, content);

            return res.status(201).json({
                status: "success",
                message: "Message sent successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to send message",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/messages/conversation/:userId
    async getConversation(req, res) {
        try {
            const currentUserId = req.user._id;
            const otherUserId = req.params.userId;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, parseInt(req.query.limit) || 20);

            const response = await this.messageService.getConversation(currentUserId, otherUserId, page, limit);

            return res.status(200).json({
                status: "success",
                message: "Conversation fetched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch conversation",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/messages/conversations
    async getConversations(req, res) {
        try {
            const currentUserId = req.user._id;
            const response = await this.messageService.getConversations(currentUserId);

            return res.status(200).json({
                status: "success",
                message: "Conversations list fetched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch conversations",
                data: {},
                err: error.message
            });
        }
    }

    // PATCH /api/v1/messages/:messageId/read
    async markAsRead(req, res) {
        try {
            const userId = req.user._id;
            const messageId = req.params.messageId;

            const response = await this.messageService.markAsRead(messageId, userId);

            return res.status(200).json({
                status: "success",
                message: "Message marked as read",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to mark message as read",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = MessageController;
