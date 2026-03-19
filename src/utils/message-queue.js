// add detailed comments to whole code
// give me comments and explain the code donot wait for me to right the code

const amqplib = require('amqplib');
const { RABBITMQ_URL, RABBITMQ_EXCHANGE } = require('../config/serverConfig');

// created a single channel instance to be shared across the application
let channel;


/**
 * Connects to RabbitMQ server
 * Creates channel (like a communication pipe)
 * Creates/ensures exchange exists
 * Exchange is like a router that directs messages to queues based on routing keys
 * If connection or channel creation fails, logs error and exits process
 * direct exchange type allows messages to be routed to queues based on exact routing key match
 * durable: true ensures that the exchange will survive RabbitMQ restarts
 * connectQueue() should be called once during server startup to initialize the connection and channel before any events are published or consumed in server.js
 */
const connectQueue = async () => {
    try {
        const connection = await amqplib.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertExchange(RABBITMQ_EXCHANGE, 'direct', { durable: true });
        console.log('RabbitMQ channel created');
    } catch (err) {
        console.error('❌ Failed to connect to RabbitMQ:', err);
        process.exit(1);
    }
};

/**
 * Returns the initialized RabbitMQ channel
 * Throws an error if channel is not initialized
 */
const getChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized. Call connectQueue() first.');
    }
    return channel;
};

module.exports = {
    connectQueue,
    getChannel
};

/*

User Action (Follow / Like / Comment)
        ↓
FollowService (business logic)
        ↓
publishEvent()  → RabbitMQ (Exchange)
        ↓
Queue (via routing key)
        ↓
NotificationConsumer
        ↓
NotificationService
        ↓
NotificationRepository
        ↓
MongoDB (Notification stored)

*/