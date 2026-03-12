const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
}, { timestamps: true }

);

/**
 * Prevent duplicate likes from same user on same tweet
 * { unique: true } -> unique record
 * { tweet: 1, user: 1 } -> sorting
 */
likeSchema.index({ tweet: 1, user: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
