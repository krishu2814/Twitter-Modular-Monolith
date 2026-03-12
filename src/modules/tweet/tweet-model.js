const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    // tweet is done by user 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // reference to user
        required: true
    }
}, { timestamps: true }

);

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
