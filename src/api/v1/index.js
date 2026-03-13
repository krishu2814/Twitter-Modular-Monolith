const express = require('express');

const userRoutes = require('./user-routes');
const authRoutes = require('./auth-routes');
const tweetRoutes = require('./tweet-routes');
const likeRoutes = require('./like-routes');
const followRoutes = require('./follow-routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);
router.use('/likes', likeRoutes);
router.use('/follows', followRoutes);

module.exports = router;
