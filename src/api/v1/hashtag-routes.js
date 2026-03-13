const express = require('express');

const router = express.Router();

const HashtagController = require('../../modules/hashtag/hashtag-controller');
const hashtagController = new HashtagController();

/**
 * GET TWEETS BY HASHTAG
 * /hashtags/nodejs
 */

router.get('/:title', hashtagController.getTweetsByHashtag.bind(hashtagController));

module.exports = router;
