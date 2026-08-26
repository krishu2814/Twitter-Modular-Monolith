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
    commentsCount: {
        type: Number,
        default: 0
    },
    bookmarksCount: {
        type: Number,
        default: 0
    },
    viewsCount: {
        type: Number,
        default: 0
    },
    // if tweet is a quote tweet
    quoteTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    },
    // media attachments (images, gifs, videos)
    media: [{
        url: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: ['IMAGE', 'GIF', 'VIDEO'],
            default: 'IMAGE'
        }
    }],
    // tweet poll
    poll: {
        question: {
            type: String,
            default: null
        },
        options: [{
            text: { type: String, required: true },
            votes: { type: Number, default: 0 },
            voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        }],
        expiresAt: {
            type: Date,
            default: null
        }
    }
}, { timestamps: true }

);

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
