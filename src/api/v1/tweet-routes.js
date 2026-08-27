const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const TweetController = require('../../modules/tweet/tweet-controller');
const tweetController = new TweetController();

// create tweet
router.post('/create', authentication, tweetController.create.bind(tweetController));

// get all tweets
router.get('/', tweetController.getAll.bind(tweetController));

// get tweet by id
router.get('/get/:id', tweetController.get.bind(tweetController));

// get tweets by user
router.get('/user/:userId', tweetController.getTweetsByUser.bind(tweetController));

// pin tweet to profile
router.post('/pin/:id', authentication, tweetController.pinTweet.bind(tweetController));

// unpin tweet from profile
router.post('/unpin', authentication, tweetController.unpinTweet.bind(tweetController));

// vote on poll
router.post('/:id/poll/vote', authentication, tweetController.votePoll.bind(tweetController));

// record view impression
router.post('/:id/view', tweetController.recordView.bind(tweetController));

// get tweet analytics (author only)
router.get('/:id/analytics', authentication, tweetController.getAnalytics.bind(tweetController));

// create multi-tweet thread
router.post('/thread', authentication, tweetController.createThread.bind(tweetController));

// get tweet thread
router.get('/:id/thread', tweetController.getThread.bind(tweetController));

// edit tweet with 30-minute grace window
router.patch('/:id/edit', authentication, tweetController.editTweet.bind(tweetController));

// update tweet
router.patch('/update/:id', authentication, tweetController.update.bind(tweetController));

// delete tweet
router.delete('/delete/:id', authentication, tweetController.delete.bind(tweetController));

module.exports = router;
