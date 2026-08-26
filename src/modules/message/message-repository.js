const Message = require('./message-model');
const mongoose = require('mongoose');

class MessageRepository {

    // 1) create message
    async create(data) {
        return await Message.create(data);
    }

    // 2) get conversation history between two users (paginated)
    async getConversation(user1, user2, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'userName profileImage')
            .populate('receiver', 'userName profileImage')
            .lean();

        const total = await Message.countDocuments({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        });

        return {
            messages,
            total
        };
    }

    // 3) get list of recent conversations for a user
    async getConversationsList(userId) {
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: userObjectId },
                        { receiver: userObjectId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userObjectId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'contact'
                }
            },
            {
                $unwind: '$contact'
            },
            {
                $project: {
                    contact: {
                        _id: 1,
                        userName: 1,
                        profileImage: 1,
                        bio: 1
                    },
                    lastMessage: {
                        _id: 1,
                        content: 1,
                        sender: 1,
                        receiver: 1,
                        isRead: 1,
                        createdAt: 1
                    }
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);

        return conversations;
    }

    // 4) mark single message as read
    async markAsRead(messageId, userId) {
        return await Message.findOneAndUpdate(
            { _id: messageId, receiver: userId },
            { isRead: true },
            { returnDocument: 'after' }
        );
    }

    // 5) mark all unread messages from a contact as read
    async markAllAsReadFromUser(senderId, receiverId) {
        return await Message.updateMany(
            { sender: senderId, receiver: receiverId, isRead: false },
            { isRead: true }
        );
    }

}

module.exports = MessageRepository;
