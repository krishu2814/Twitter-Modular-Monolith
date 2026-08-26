const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const ScheduledTweetController = require('../../modules/scheduled/scheduled-tweet-controller');
const scheduledTweetController = new ScheduledTweetController();

// Schedule a tweet: POST /api/v1/scheduled-tweets
router.post('/', authentication, scheduledTweetController.schedule.bind(scheduledTweetController));

// Get my scheduled tweets: GET /api/v1/scheduled-tweets/me
router.get('/me', authentication, scheduledTweetController.getMyScheduled.bind(scheduledTweetController));

// Cancel scheduled tweet: DELETE /api/v1/scheduled-tweets/:id
router.delete('/:id', authentication, scheduledTweetController.cancel.bind(scheduledTweetController));

// Process due scheduled tweets: POST /api/v1/scheduled-tweets/process-due
router.post('/process-due', scheduledTweetController.processDue.bind(scheduledTweetController));

module.exports = router;
