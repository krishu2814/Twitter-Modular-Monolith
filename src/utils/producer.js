const { getChannel } = require('./message-queue');
const { RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY } = require('../config/serverConfig');

/**
 * Publishes an event to RabbitMQ exchange with a specific routing key
 * Converts the data to a Buffer and sends it to the exchange
 * Buffer is a Node.js class for handling binary data, used here to convert the JSON string into a format suitable for RabbitMQ
 * Logs success or failure of publishing the event
 * The message is marked as persistent to survive RabbitMQ restarts
 * Used by services to send events (like notifications) to the message queue for asynchronous processing
 * Example usage:
 * publishEvent({ type: 'LIKE', userId: 123, tweetId: 456 });
 */
const publishEvent = async (data) => {
    try {
        const channel = getChannel();
        const messageBuffer = Buffer.from(JSON.stringify(data));
        channel.publish(RABBITMQ_EXCHANGE, RABBITMQ_ROUTING_KEY, messageBuffer, { persistent: true });
        console.log('Event published:', data);
    } catch (err) {
        console.error('❌ Failed to publish event:', err);
    }
};

module.exports = {
    publishEvent
};
