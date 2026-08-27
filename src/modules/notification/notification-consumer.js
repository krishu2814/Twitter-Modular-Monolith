const { getChannel } = require('../../utils/message-queue');
const NotificationService = require('./notification-service');
const Notification = require('./notification-model');
const { emitToUser } = require('../../utils/socket-server');
const { RABBITMQ_EXCHANGE, RABBITMQ_QUEUE, RABBITMQ_ROUTING_KEY } = require('../../config/serverConfig');

class NotificationConsumer {
    constructor() {
        this.notificationService = new NotificationService();
    }

    async start() {
        try {
            // Ensure the queue exists and bind it to the exchange with the routing key
            const channel = getChannel();
            // durable: true ensures that the queue will survive RabbitMQ restarts
            // assertQueue creates the queue if it doesn't exist, or ensures it exists if it does
            await channel.assertQueue(RABBITMQ_QUEUE, { durable: true });
            // bind the queue to the exchange with the routing key so it receives relevant messages
            // exchange is like a router that directs messages to queues based on routing keys
            await channel.bindQueue(RABBITMQ_QUEUE, RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY);
            console.log('✅ Notification consumer started, waiting for messages...');

            // consume messages from the queue
            channel.consume(RABBITMQ_QUEUE, async (msg) => {
                if (msg !== null) {
                    try {
                        // parse the message content and create a notification
                        const messageContent = msg.content.toString();
                        // log the type of notification received for debugging
                        const notificationData = JSON.parse(messageContent);
                        console.log(`${notificationData.type} notification received`);

                        // create the notification in the database using the notification service
                        const createdNotification = await this.notificationService.createNotification(notificationData);

                        // Push real-time notification to user's WebSocket room
                        try {
                            const [populatedNotif, unreadCount] = await Promise.all([
                                Notification.findById(createdNotification._id).populate('actor', 'userName profileImage').lean(),
                                Notification.countDocuments({ user: notificationData.user, isRead: false })
                            ]);

                            emitToUser(notificationData.user.toString(), 'notification:received', {
                                notification: populatedNotif || createdNotification,
                                unreadCount
                            });
                        } catch (socketErr) {
                            console.error('❌ Failed to emit real-time notification socket event:', socketErr.message);
                        }

                    } catch (err) {
                        console.error('❌ Error processing notification:', err);
                    } finally {
                        channel.ack(msg);
                    }
                }
            }, { noAck: false });
        } catch (err) {
            console.error('❌ Failed to start notification consumer:', err);
        }
    }
}

module.exports = NotificationConsumer;
