const HashtagService = require('./hashtag-service');

class HashtagController {

    constructor() {
        this.hashtagService = new HashtagService();
    }

    async getTweetsByHashtag(req, res) {

        try {

            const { title } = req.params;

            const result = await this.hashtagService.getTweetsByHashtag(title);

            return res.status(200).json({
                success: true,
                message: "Hashtag tweets fetched",
                data: result,
                err: {}
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: "Error fetching hashtag tweets",
                data: {},
                err: error.message
            });

        }

    }

    async getTrending(req, res) {
        try {
            const limit = Math.min(50, parseInt(req.query.limit) || 10);
            const result = await this.hashtagService.getTrendingHashtags(limit);

            return res.status(200).json({
                success: true,
                message: "Trending hashtags fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Error fetching trending hashtags",
                data: {},
                err: error.message
            });
        }
    }

}

module.exports = HashtagController;
