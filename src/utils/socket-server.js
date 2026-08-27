const { Server } = require('socket.io');
const JWT = require('jsonwebtoken');
const { SECRET_TOKEN } = require('../config/serverConfig');
const UserRepository = require('../modules/user/user-repository');

let io = null;
const activeUsers = new Map(); // userId -> Set<socketId>
const userRepository = new UserRepository();

/**
 * Initialize Socket.io server and register middleware & event handlers
 */
function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PATCH", "DELETE"]
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // 1) Authentication Middleware
    io.use(async (socket, next) => {
        try {
            let token = socket.handshake.auth?.token;
            if (!token && socket.handshake.headers?.authorization) {
                const parts = socket.handshake.headers.authorization.split(' ');
                token = parts.length === 2 ? parts[1] : parts[0];
            }

            if (!token) {
                return next(new Error('Authentication error: Authorization token missing'));
            }

            const decoded = JWT.verify(token, SECRET_TOKEN);
            const user = await userRepository.getUserById(decoded.id);

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (err) {
            return next(new Error('Authentication error: ' + (err.message || 'Invalid token')));
        }
    });

    // 2) Connection Handler
    io.on('connection', async (socket) => {
        const userId = socket.user._id.toString();
        const userName = socket.user.userName;

        // Add socket ID to user's set of active sockets
        const isFirstConnection = !activeUsers.has(userId) || activeUsers.get(userId).size === 0;
        if (!activeUsers.has(userId)) {
            activeUsers.set(userId, new Set());
        }
        activeUsers.get(userId).add(socket.id);

        // Join private user room for targeted emissions
        socket.join(`user:${userId}`);

        // Update presence if this is user's first active connection
        if (isFirstConnection) {
            try {
                await userRepository.updateUserPresence(userId, true);
                io.emit('user:online', {
                    userId,
                    userName,
                    isOnline: true,
                    timestamp: new Date()
                });
                io.emit('presence:update', {
                    userId,
                    userName,
                    isOnline: true,
                    timestamp: new Date()
                });
            } catch (presenceErr) {
                console.error('❌ Failed to update user online presence:', presenceErr);
            }
        }

        // --- Socket Event Listeners ---

        // A. Live DM Sending over WebSockets
        socket.on('dm:send', async (data, callback) => {
            try {
                const { receiverId, content } = data;
                const MessageService = require('../modules/message/message-service');
                const messageService = new MessageService();
                const message = await messageService.sendMessage(userId, receiverId, content);

                if (typeof callback === 'function') {
                    callback({ status: 'success', data: message });
                }
            } catch (err) {
                if (typeof callback === 'function') {
                    callback({ status: 'error', message: err.message });
                }
            }
        });

        // B. Real-Time Typing Indicators
        socket.on('typing:start', (data) => {
            if (data && data.receiverId) {
                io.to(`user:${data.receiverId.toString()}`).emit('typing:started', {
                    senderId: userId,
                    userName: socket.user.userName
                });
            }
        });

        socket.on('typing:stop', (data) => {
            if (data && data.receiverId) {
                io.to(`user:${data.receiverId.toString()}`).emit('typing:stopped', {
                    senderId: userId
                });
            }
        });

        // C. Real-Time Message Read Receipts
        socket.on('message:read', async (data) => {
            try {
                if (data && data.messageId && data.senderId) {
                    const MessageService = require('../modules/message/message-service');
                    const messageService = new MessageService();
                    await messageService.markAsRead(data.messageId, userId);

                    io.to(`user:${data.senderId.toString()}`).emit('message:read_receipt', {
                        messageId: data.messageId,
                        readBy: userId,
                        readAt: new Date()
                    });
                }
            } catch (readErr) {
                console.error('❌ Error handling message:read socket event:', readErr.message);
            }
        });

        // D. Active Presence Query
        socket.on('presence:query', async (data, callback) => {
            try {
                const targetIds = Array.isArray(data?.userIds) ? data.userIds : [];
                const result = {};

                for (const tId of targetIds) {
                    const idStr = tId.toString();
                    const isOnline = isUserOnline(idStr);
                    result[idStr] = { isOnline };
                }

                if (typeof callback === 'function') {
                    callback({ status: 'success', data: result });
                }
            } catch (queryErr) {
                if (typeof callback === 'function') {
                    callback({ status: 'error', message: queryErr.message });
                }
            }
        });

        // E. Disconnection Handler
        socket.on('disconnect', async () => {
            if (activeUsers.has(userId)) {
                activeUsers.get(userId).delete(socket.id);
                if (activeUsers.get(userId).size === 0) {
                    activeUsers.delete(userId);
                    const lastSeen = new Date();
                    try {
                        await userRepository.updateUserPresence(userId, false);
                        io.emit('user:offline', {
                            userId,
                            userName,
                            isOnline: false,
                            lastSeen
                        });
                        io.emit('presence:update', {
                            userId,
                            userName,
                            isOnline: false,
                            lastSeen
                        });
                    } catch (presenceErr) {
                        console.error('❌ Failed to update user offline presence:', presenceErr);
                    }
                }
            }
        });
    });

    return io;
}

/**
 * Get initialized Socket.io instance
 */
function getIO() {
    return io;
}

/**
 * Emit event to a specific user's private room
 */
function emitToUser(userId, event, data) {
    if (io && userId) {
        io.to(`user:${userId.toString()}`).emit(event, data);
    }
}

/**
 * Check if a user is currently connected to WebSockets
 */
function isUserOnline(userId) {
    if (!userId) return false;
    const userSockets = activeUsers.get(userId.toString());
    return Boolean(userSockets && userSockets.size > 0);
}

/**
 * Get array of all currently online user IDs
 */
function getOnlineUserIds() {
    return Array.from(activeUsers.keys());
}

module.exports = {
    initSocket,
    getIO,
    emitToUser,
    isUserOnline,
    getOnlineUserIds
};
