const ScheduledTweetService = require('./scheduled-tweet-service');

class ScheduledTweetController {
    constructor() {
        this.scheduledTweetService = new ScheduledTweetService();
    }

    // POST /api/v1/scheduled-tweets
    async schedule(req, res) {
        try {
            const authorId = req.user._id;
            const result = await this.scheduledTweetService.scheduleTweet(authorId, req.body);

            return res.status(201).json({
                status: "success",
                message: "Tweet scheduled successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while scheduling tweet",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/scheduled-tweets/me
    async getMyScheduled(req, res) {
        try {
            const authorId = req.user._id;
            const result = await this.scheduledTweetService.getMyScheduledTweets(authorId);

            return res.status(200).json({
                status: "success",
                message: "Scheduled tweets fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching scheduled tweets",
                data: {},
                err: error.message
            });
        }
    }

    // DELETE /api/v1/scheduled-tweets/:id
    async cancel(req, res) {
        try {
            const authorId = req.user._id;
            const result = await this.scheduledTweetService.cancelScheduledTweet(req.params.id, authorId);

            return res.status(200).json({
                status: "success",
                message: "Scheduled tweet cancelled successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while cancelling scheduled tweet",
                data: {},
                err: error.message
            });
        }
    }

    // POST /api/v1/scheduled-tweets/process-due
    async processDue(req, res) {
        try {
            const result = await this.scheduledTweetService.publishDueTweets();

            return res.status(200).json({
                status: "success",
                message: "Due tweets processed successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while processing due tweets",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = ScheduledTweetController;
