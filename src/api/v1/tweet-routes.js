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

// update tweet
router.patch('/update/:id', authentication, tweetController.update.bind(tweetController));

// delete tweet
router.delete('/delete/:id', authentication, tweetController.delete.bind(tweetController));

module.exports = router;
