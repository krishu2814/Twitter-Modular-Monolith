const bcrypt = require('bcrypt');

const dotenv = require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 10,
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    EXPIRES_IN: process.env.EXPIRES_IN,
    EXCHANGE_NAME: process.env.EXCHANGE_NAME,
    RABBITMQ_URL: process.env.RABBITMQ_URL,
    RABBITMQ_EXCHANGE: process.env.RABBITMQ_EXCHANGE,
    RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE,
    RABBITMQ_ROUTING_KEY: process.env.RABBITMQ_ROUTING_KEY
}