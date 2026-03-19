const CommentService = require('./comment-service');

class CommentController {

    constructor() {
        this.commentService = new CommentService();
    }

    async createComment(req, res) {
        try {

            const { content } = req.body; // in body -> JSON
            const tweetId = req.params.tweetId; // in params url
            const userId = req.user._id; // authentication

            const comment = await this.commentService.createComment(
                content,
                userId,
                tweetId
            );

            return res.status(201).json({
                success: true,
                message: "Comment created successfully",
                data: comment,
                err: {}
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: "Unable to create comment",
                data: {},
                err: error.message
            });

        }
    }

    async deleteComment(req, res) {
        try {

            const { commentId } = req.params;
            const userId = req.user.id;

            await this.commentService.deleteComment(commentId, userId);

            return res.status(200).json({
                success: true,
                message: "Comment deleted successfully",
                data: {},
                err: {}
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: "Unable to delete comment",
                data: {},
                err: error.message
            });

        }
    }

    async getCommentsByTweet(req, res) {
        try {

            const { tweetId } = req.params;

            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, parseInt(req.query.limit) || 10);

            const comments = await this.commentService.getCommentByTweet(tweetId, page, limit);

            return res.status(200).json({
                success: true,
                message: "Comments fetched successfully",
                data: comments,
                err: {}
            });

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: "Unable to fetch comments",
                data: {},
                err: error.message
            });

        }
    }
}

module.exports = CommentController;
