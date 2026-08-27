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
    },
    // Thread fields
    parentTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    },
    threadHead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    },
    threadPosition: {
        type: Number,
        default: 1
    },
    isThread: {
        type: Boolean,
        default: false
    },
    threadLength: {
        type: Number,
        default: 1
    },
    // Edit fields & history audit trail
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    },
    editHistory: [{
        content: {
            type: String,
            required: true
        },
        media: [{
            url: { type: String, required: true },
            type: { type: String, enum: ['IMAGE', 'GIF', 'VIDEO'], default: 'IMAGE' }
        }],
        editedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Moderation & safety fields
    reportsCount: {
        type: Number,
        default: 0
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }

);

// Compound indexes for thread lookups and feed queries
tweetSchema.index({ threadHead: 1, threadPosition: 1 });
tweetSchema.index({ parentTweet: 1 });
tweetSchema.index({ author: 1, createdAt: -1 });

const Tweet = mongoose.model('Tweet', tweetSchema);

module.exports = Tweet;
