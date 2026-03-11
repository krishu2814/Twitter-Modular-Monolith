const bcrypt = require('bcrypt');

const dotenv = require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    MONGO_URL: process.env.MONGO_URL,
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS) || 10,
    SECRET_TOKEN: process.env.SECRET_TOKEN,
    EXPIRES_IN: process.env.EXPIRES_IN,
}