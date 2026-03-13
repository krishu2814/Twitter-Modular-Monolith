const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    // single hashtag can belong to multiple tweets
    // Array
    tweets:
    [ 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tweet'
        }
    ]
}, { timestamps: true }
    
);

const Hashtag = mongoose.model('Hashtag', hashtagSchema);

module.exports = Hashtag;
