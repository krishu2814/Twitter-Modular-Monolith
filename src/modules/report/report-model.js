const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedTweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['SPAM', 'HARASSMENT', 'HATE_SPEECH', 'MISINFORMATION', 'VIOLENCE', 'OTHER'],
        required: true
    },
    description: {
        type: String,
        default: "",
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
        default: 'PENDING'
    },
    actionTaken: {
        type: String,
        enum: ['NONE', 'TWEET_HIDDEN', 'TWEET_DELETED', 'USER_WARNED', 'NO_ACTION'],
        default: 'NONE'
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    resolvedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Prevent duplicate reports by the same user on the same tweet
reportSchema.index({ reporter: 1, reportedTweet: 1 }, { unique: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
