const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPrivate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

listSchema.index({ owner: 1, createdAt: -1 });

const List = mongoose.model('List', listSchema);

module.exports = List;
