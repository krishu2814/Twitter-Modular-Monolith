const mongoose = require('mongoose');
const { MONGO_URL } = require('../config/serverConfig');

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to mongoDB database.');
    } catch (error) {
        throw error;
    }
}

module.exports = connectDB;
