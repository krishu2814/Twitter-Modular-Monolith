const MessageRepository = require('./message-repository');
const UserRepository = require('../user/user-repository');
const BlockRepository = require('../block/block-repository');
const { publishEvent } = require('../../utils/producer');
const { emitToUser } = require('../../utils/socket-server');

class MessageService {
    constructor() {
        this.messageRepository = new MessageRepository();
        this.userRepository = new UserRepository();
        this.blockRepository = new BlockRepository();
    }

    // 1) send a direct message
    async sendMessage(senderId, receiverId, content) {
        // self-message check
        if (senderId.toString() === receiverId.toString()) {
            throw new Error("Cannot send a message to yourself");
        }

        // check if either user has blocked the other
        const isBlocked = await this.blockRepository.isBlockedEither(senderId, receiverId);
        if (isBlocked) {
            throw new Error("Cannot send message to this user due to block restrictions");
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

        // Emit real-time WebSocket events to receiver & sender
        try {
            const populatedMsg = await this.messageRepository.getMessageById(message._id) || message;
            emitToUser(receiverId.toString(), 'message:received', populatedMsg);
            emitToUser(senderId.toString(), 'message:sent', populatedMsg);
        } catch (socketErr) {
            console.error('❌ Failed to emit real-time message socket event:', socketErr.message);
        }

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

        // Emit real-time read receipt to message sender
        try {
            if (message.sender) {
                const senderId = message.sender._id ? message.sender._id.toString() : message.sender.toString();
                emitToUser(senderId, 'message:read_receipt', {
                    messageId: message._id.toString(),
                    readBy: userId.toString(),
                    readAt: new Date()
                });
            }
        } catch (receiptErr) {
            console.error('❌ Failed to emit read receipt event:', receiptErr.message);
        }

        return message;
    }
}

module.exports = MessageService;
