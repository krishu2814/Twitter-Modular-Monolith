const express = require('express');

const userRoutes = require('./user-routes');
const authRoutes = require('./auth-routes');
const tweetRoutes = require('./tweet-routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);

module.exports = router;
