const MessageRepository = require('./message-repository');
const UserRepository = require('../user/user-repository');
const { publishEvent } = require('../../utils/producer');

class MessageService {
    constructor() {
        this.messageRepository = new MessageRepository();
        this.userRepository = new UserRepository();
    }

    // 1) send a direct message
    async sendMessage(senderId, receiverId, content) {
        // self-message check
        if (senderId.toString() === receiverId.toString()) {
            throw new Error("Cannot send a message to yourself");
        }

        // verify receiver exists
        const receiver = await this.userRepository.getUserById(receiverId);
        if (!receiver) {
            throw new Error("Receiver not found");
        }

        if (!content || content.trim() === '') {
            throw new Error("Message content cannot be empty");
        }

        // create message
        const message = await this.messageRepository.create({
            sender: senderId,
            receiver: receiverId,
            content: content.trim()
        });

        // publish MESSAGE event to RabbitMQ
        await publishEvent({
            user: receiverId.toString(),
            actor: senderId.toString(),
            type: "MESSAGE",
            entityId: message._id.toString()
        });

        return message;
    }

    // 2) get conversation history with a user
    async getConversation(userId, otherUserId, page = 1, limit = 20) {
        const otherUser = await this.userRepository.getUserById(otherUserId);
        if (!otherUser) {
            throw new Error("User not found");
        }

        // Auto mark unread messages from otherUser as read
        await this.messageRepository.markAllAsReadFromUser(otherUserId, userId);

        const result = await this.messageRepository.getConversation(userId, otherUserId, page, limit);

        return {
            messages: result.messages,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }

    // 3) get list of recent conversations
    async getConversations(userId) {
        return await this.messageRepository.getConversationsList(userId);
    }

    // 4) mark message as read
    async markAsRead(messageId, userId) {
        const message = await this.messageRepository.markAsRead(messageId, userId);
        if (!message) {
            throw new Error("Message not found or unauthorized");
        }
        return message;
    }
}

module.exports = MessageService;
