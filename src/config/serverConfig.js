require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 6000,
    MONGO_URL: process.env.MONGO_URL,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 10,
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    EXPIRES_IN: process.env.EXPIRES_IN || '7d',
    EXCHANGE_NAME: process.env.EXCHANGE_NAME || process.env.RABBITMQ_EXCHANGE || 'NOTIFICATION',
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
    RABBITMQ_EXCHANGE: process.env.RABBITMQ_EXCHANGE || process.env.EXCHANGE_NAME || 'NOTIFICATION',
    RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE || 'notification-queue',
    RABBITMQ_ROUTING_KEY: process.env.RABBITMQ_ROUTING_KEY || 'NOTIFY'
};