const RetweetService = require('./retweet-service');

class RetweetController {
    constructor() {
        this.retweetService = new RetweetService();
    }

    // POST /api/v1/retweets/:tweetId
    async toggle(req, res) {
        try {
            const userId = req.user._id;
            const tweetId = req.params.tweetId;

            const response = await this.retweetService.toggleRetweet(userId, tweetId);

            return res.status(200).json({
                status: "success",
                message: "Retweet toggled successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Cannot toggle retweet",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/retweets/tweet/:tweetId
    async getRetweetsByTweet(req, res) {
        try {
            const response = await this.retweetService.getRetweetsByTweet(req.params.tweetId);
            return res.status(200).json({
                status: "success",
                message: "Retweets fetched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch retweets",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/retweets/user/:userId
    async getRetweetsByUser(req, res) {
        try {
            const response = await this.retweetService.getRetweetsByUser(req.params.userId);
            return res.status(200).json({
                status: "success",
                message: "User retweets fetched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch user retweets",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = RetweetController;
