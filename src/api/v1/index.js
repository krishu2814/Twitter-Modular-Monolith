const express = require('express');

const userRoutes = require('./user-routes');
const authRoutes = require('./auth-routes');
const tweetRoutes = require('./tweet-routes');
const likeRoutes = require('./like-routes');
const followRoutes = require('./follow-routes');
const commentRoutes = require('./comment-routes');
const hashtagRoutes = require('./hashtag-routes');
const feedRoutes = require('./feed-routes');
const notificationRoutes = require('./notification-routes');
const retweetRoutes = require('./retweet-routes');
const searchRoutes = require('./search-routes');
const bookmarkRoutes = require('./bookmark-routes');
const messageRoutes = require('./message-routes');
const blockRoutes = require('./block-routes');
const listRoutes = require('./list-routes');
const muteRoutes = require('./mute-routes');
const scheduledTweetRoutes = require('./scheduled-tweet-routes');
const reportRoutes = require('./report-routes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/tweets', tweetRoutes);
router.use('/likes', likeRoutes);
router.use('/retweets', retweetRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/follows', followRoutes);
router.use('/comments', commentRoutes);
router.use('/hashtags', hashtagRoutes);
router.use('/feeds', feedRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search', searchRoutes);
router.use('/messages', messageRoutes);
router.use('/blocks', blockRoutes);
router.use('/lists', listRoutes);
router.use('/mutes', muteRoutes);
router.use('/scheduled-tweets', scheduledTweetRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
