const CommentRepository = require('./comment-repository');

class CommentService {
    constructor() {
        this.commentRepository = new CommentRepository();
    }

    async createComment(content, userId, tweetId) {

        try {
            const comment = await this.commentRepository.createComment({
                content,
                user: userId,
                tweet: tweetId
            });
            return comment;
        } catch (error) {
            throw error;
        }
    }

    async deleteComment(commentId, userId) {
        // get comment + tweet owner
        const comment = await this.commentRepository
            .getComment(commentId)
            .populate('tweet');

        if (!comment) {
            throw new Error('Comment not found!');
        }

        const commentOwner = comment.user.toString();
        const tweetOwner = comment.tweet.user.toString();

        /**
         * WHO CAN DELETE COMMENT
         * Comment Owner
         * Tweet Owner
         */
        if (commentOwner !== userId.toString() && tweetOwner !== userId.toString()) {
            throw new Error("Unauthorized to delete this comment");
        }

        return await this.commentRepository.deleteComment(commentId);
    }

    async getCommentByTweet(tweetId) {
        try {
            const comment = await this.commentRepository.getCommentsByTweet(tweetId);
            return comment;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = CommentService;
