const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true // remove any leading or trailing whitespace
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
      type: String,
      default: ""
    },
    profileImage: {
      type: String,
      default: ""
    },

    followersCount: {
      type: Number,
      default: 0
    },

    followingCount: {
      type: Number,
      default: 0
    }
},
    { timestamps: true } // created at , updated at

);

const User = mongoose.model('User', userSchema);

module.exports = User;
