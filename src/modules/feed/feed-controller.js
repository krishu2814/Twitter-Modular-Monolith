const FeedRepository = require('./feed-repository');
const FeedService = require('./feed-service');

class FeedController {
    constructor() {
        this.feedRepository = new FeedRepository();
        this.feedService = new FeedService(this.feedRepository);
    }

    async getFeed(req, res) {
        try {
            const userId = req.user.id; // from auth middleware

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 20;
            const feed = await this.feedService.getFeed(userId, page, limit);
            return res.status(200).json({
                success: true,
                message: "Feed fetched successfully",
                data: feed
            });
        } catch (error) {
            console.error("FEED ERROR:", error);
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = FeedController;
