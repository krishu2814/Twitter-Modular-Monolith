const express = require('express');

const router = express.Router();

const HashtagController = require('../../modules/hashtag/hashtag-controller');
const hashtagController = new HashtagController();

/**
 * GET TRENDING HASHTAGS
 * GET /hashtags/trending
 */
router.get('/trending', hashtagController.getTrending.bind(hashtagController));

/**
 * GET TWEETS BY HASHTAG
 * GET /hashtags/:title
 */
router.get('/:title', hashtagController.getTweetsByHashtag.bind(hashtagController));

module.exports = router;
