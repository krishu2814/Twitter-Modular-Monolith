const LikeService = require('./like-service');

class LikeController {
    constructor() {
        this.likeService = new LikeService();
    }

    async toggle(req, res) {
        try {

            const userId = req.user._id;       // from auth middleware -> JWT Token
            const tweetId = req.params.tweetId; // URL params

            const result = await this.likeService.toggleLike(
                userId,
                tweetId
            );
            return res.status(200).json({
                status: "success",
                message: "Toggle done successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Cannot toggle like",
                data: {},
                err: error.message
            });

        }
    }
}

module.exports = LikeController;
