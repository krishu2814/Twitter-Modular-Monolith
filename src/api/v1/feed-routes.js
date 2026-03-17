const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');

const FeedController = require('../../modules/feed/feed-controller');
const feedController = new FeedController();

router.get('/', authentication, feedController.getFeed.bind(feedController));

module.exports = router;
