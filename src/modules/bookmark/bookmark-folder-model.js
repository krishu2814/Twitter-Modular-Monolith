const mongoose = require('mongoose');

const bookmarkFolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    description: {
        type: String,
        default: "",
        maxlength: 200
    },
    icon: {
        type: String,
        default: "📁"
    },
    color: {
        type: String,
        default: "#1DA1F2"
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tweets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tweet'
    }]
}, { timestamps: true });

// Prevent duplicate folder names for the same user
bookmarkFolderSchema.index({ owner: 1, name: 1 }, { unique: true });

const BookmarkFolder = mongoose.model('BookmarkFolder', bookmarkFolderSchema);

module.exports = BookmarkFolder;
