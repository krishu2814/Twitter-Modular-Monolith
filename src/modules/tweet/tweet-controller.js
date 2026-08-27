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
                quoteTweet: req.body.quoteTweet || null,
                poll: req.body.poll || null,
                media: req.body.media || []
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

    // vote on poll
    async votePoll(req, res) {
        try {
            const { optionIndex } = req.body;
            const result = await this.tweetService.votePoll(req.params.id, req.user._id, optionIndex);
            return res.status(200).json({
                status: "success",
                message: "Vote recorded successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while voting on poll.",
                data: {},
                err: error
            });
        }
    }

    // record view impression
    async recordView(req, res) {
        try {
            const result = await this.tweetService.recordView(req.params.id);
            return res.status(200).json({
                status: "success",
                message: "Impression recorded successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while recording impression.",
                data: {},
                err: error
            });
        }
    }

    // get tweet analytics
    async getAnalytics(req, res) {
        try {
            const result = await this.tweetService.getAnalytics(req.params.id, req.user._id);
            return res.status(200).json({
                status: "success",
                message: "Analytics fetched successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching analytics.",
                data: {},
                err: error
            });
        }
    }

    // create multi-tweet thread: POST /api/v1/tweets/thread
    async createThread(req, res) {
        try {
            const authorId = req.user._id;
            const result = await this.tweetService.createThread(authorId, req.body);
            return res.status(201).json({
                status: "success",
                message: "Tweet thread published successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(error.message && (error.message.includes('Thread must contain') || error.message.includes('cannot have empty content')) ? 400 : 500).json({
                status: "error",
                message: error.message || "Something went wrong while publishing the tweet thread.",
                data: {},
                err: error.message
            });
        }
    }

    // get tweet thread: GET /api/v1/tweets/:id/thread
    async getThread(req, res) {
        try {
            const result = await this.tweetService.getThread(req.params.id);
            return res.status(200).json({
                status: "success",
                message: "Tweet thread fetched successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(error.message === 'Tweet not found' ? 404 : 500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching the tweet thread.",
                data: {},
                err: error.message
            });
        }
    }

    // edit tweet with 30-minute grace window: PATCH /api/v1/tweets/:id/edit
    async editTweet(req, res) {
        try {
            const tweetId = req.params.id;
            const userId = req.user._id;
            const updatedTweet = await this.tweetService.editTweet(tweetId, userId, req.body);
            return res.status(200).json({
                status: "success",
                message: "Tweet edited successfully.",
                data: updatedTweet,
                err: {}
            });
        } catch (error) {
            const isGraceExpired = error.message && error.message.includes('grace window');
            const isUnauthorized = error.message && error.message.includes('Unauthorized');
            const isNotFound = error.message === 'Tweet not found';
            const isValidationError = error.message && (error.message.includes('empty') || error.message.includes('required') || error.message.includes('Invalid'));
            const statusCode = isUnauthorized ? 403 : (isGraceExpired || isNotFound || isValidationError ? 400 : 500);

            return res.status(statusCode).json({
                status: "error",
                message: error.message || "Something went wrong while editing the tweet.",
                data: {},
                err: error.message
            });
        }
    }

}

module.exports = TweetController;
