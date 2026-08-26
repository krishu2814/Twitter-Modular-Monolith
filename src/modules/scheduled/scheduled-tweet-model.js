const mongoose = require('mongoose');

const scheduledTweetSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
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
    scheduledFor: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'PUBLISHED', 'CANCELLED'],
        default: 'SCHEDULED'
    },
    publishedTweetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        default: null
    }
}, { timestamps: true });

scheduledTweetSchema.index({ status: 1, scheduledFor: 1 });
scheduledTweetSchema.index({ author: 1, createdAt: -1 });

const ScheduledTweet = mongoose.model('ScheduledTweet', scheduledTweetSchema);

module.exports = ScheduledTweet;
