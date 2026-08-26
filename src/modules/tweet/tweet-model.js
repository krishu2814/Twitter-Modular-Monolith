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
    },
    likesCount: {
        type: Number,
        default: 0
    },
    retweetsCount: {
        type: Number,
        default: 0
    },
    // if tweet is a quote tweet
    quoteTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    }
}, { timestamps: true }

);

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
