const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const RetweetController = require('../../modules/retweet/retweet-controller');
const retweetController = new RetweetController();

// Toggle retweet (retweet / un-retweet)
router.post('/:tweetId', authentication, retweetController.toggle.bind(retweetController));

// Get all users who retweeted a tweet
router.get('/tweet/:tweetId', retweetController.getRetweetsByTweet.bind(retweetController));

// Get all tweets retweeted by a user
router.get('/user/:userId', retweetController.getRetweetsByUser.bind(retweetController));

module.exports = router;
