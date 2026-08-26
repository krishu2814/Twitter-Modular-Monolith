const mongoose = require('mongoose');

const retweetSchema = new mongoose.Schema({
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Prevent duplicate retweets from same user on same tweet
retweetSchema.index({ tweet: 1, user: 1 }, { unique: true });

const Retweet = mongoose.model('Retweet', retweetSchema);

module.exports = Retweet;
