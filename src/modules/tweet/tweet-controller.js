const TweetService = require('./tweet-service');

class TweetController {
    constructor() {
        this.tweetService = new TweetService();
    }

    // create tweet
    async create(req, res) {
        try {
            const tweetData = {
                content: req.body.content,
                author: req.user._id,
                quoteTweet: req.body.quoteTweet || null
            };
            const tweet = await this.tweetService.create(tweetData);
            return res.status(201).json({
                status: "success",
                message: "Tweet created successfully.",
                data: tweet,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while creating the tweet.",
                data: {},
                err: error
            }); 
        }
    }

    // get tweet by id
    async get(req, res) {
        try {
            const tweet = await this.tweetService.get(req.params.id);
            return res.status(200).json({
                status: "success",
                message: "Tweet fetched successfully.",
                data: tweet,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching tweet.",
                data: {},
                err: error
            });

        }
    }

    // get all tweets
    async getAll(req, res) {
        try {
            const tweets = await this.tweetService.getAll();
            return res.status(200).json({
                status: "success",
                message: "Tweets fetched successfully.",
                data: tweets,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching tweets.",
                data: {},
                err: error
            });

        }
    }

    // update tweet
    async update(req, res) {
        try {
            const tweet = await this.tweetService.update(
                req.params.id,
                req.user._id,
                req.body
            );
            return res.status(200).json({
                status: "success",
                message: "Tweet updated successfully.",
                data: tweet,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while updating tweet.",
                data: {},
                err: error
            });

        }
    }

    // delete tweet
    async delete(req, res) {
        try {
            const tweet = await this.tweetService.delete(req.params.id, req.user._id);
            return res.status(200).json({
                status: "success",
                message: "Tweet deleted successfully.",
                data: tweet,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while deleting tweet.",
                data: {},
                err: error
            });

        }
    }

    // get tweets by user
    async getTweetsByUser(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, parseInt(req.query.limit) || 10);

            const result = await this.tweetService.getTweetsByUser(req.params.userId, page, limit);
            return res.status(200).json({
                status: "success",
                message: "User tweets fetched successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching user tweets.",
                data: {},
                err: error
            });
        }
    }

    // pin tweet
    async pinTweet(req, res) {
        try {
            const result = await this.tweetService.pinTweet(req.params.id, req.user._id);
            return res.status(200).json({
                status: "success",
                message: "Tweet pinned successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while pinning tweet.",
                data: {},
                err: error
            });
        }
    }

    // unpin tweet
    async unpinTweet(req, res) {
        try {
            const result = await this.tweetService.unpinTweet(req.user._id);
            return res.status(200).json({
                status: "success",
                message: "Tweet unpinned successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while unpinning tweet.",
                data: {},
                err: error
            });
        }
    }

}

module.exports = TweetController;
