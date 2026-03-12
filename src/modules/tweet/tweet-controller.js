const TweetService = require('./tweet-service');

class TweetController {
    constructor() {
        this.tweetService = new TweetService();
    }

    // create tweet
    async create(req, res) {
        try {
            const tweet = await this.tweetService.create(req.body);
            return res.status(201).json({
                status: "success",
                message: "Tweet created successfully.",
                data: tweet,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Something went wrong while creating the tweet.",
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
                message: "Something went wrong while fetching tweet.",
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
                message: "Something went wrong while fetching tweets.",
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
                message: "Something went wrong while updating tweet.",
                data: {},
                err: error
            });

        }
    }

    // delete tweet
    async delete(req, res) {
        try {
            const tweet = await this.tweetService.delete(req.params.id);
            return res.status(200).json({
                status: "success",
                message: "Tweet deleted successfully.",
                data: tweet,
                err: {}
            });
        } catch (error) {
            return res.status(204).json({
                status: "error",
                message: "Something went wrong while deleting tweet.",
                data: {},
                err: error
            });

        }
    }

}

module.exports = TweetController;
