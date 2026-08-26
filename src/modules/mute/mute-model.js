const mongoose = require('mongoose');

const muteSchema = new mongoose.Schema({
    muter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    muted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Compound unique index to prevent duplicate mutes
muteSchema.index({ muter: 1, muted: 1 }, { unique: true });

const Mute = mongoose.model('Mute', muteSchema);

module.exports = Mute;
