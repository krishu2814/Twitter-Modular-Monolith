const CommentRepository = require('./comment-repository');
const TweetRepository = require('../tweet/tweet-repository');
const { publishEvent } = require('../../utils/producer');

class CommentService {
    constructor() {
        this.commentRepository = new CommentRepository();
        this.tweetRepository = new TweetRepository();
    }

    async createComment(content, userId, tweetId) {

        try {
            const comment = await this.commentRepository.createComment({
                content,
                user: userId,
                tweet: tweetId
            });

            const tweet = await this.tweetRepository.getTweetById(tweetId);
            if (!tweet) {
                throw new Error('Tweet not found');
            }

            if (tweet.author.toString() !== userId.toString()) {
                await publishEvent({
                    user: tweet.author.toString(),     // tweet owner
                    actor: userId.toString(),          // commenter
                    type: "COMMENT",
                    entityId: comment._id.toString()
                });
            }
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
        const tweetOwner = comment.tweet.author.toString();

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

    async getCommentByTweet(tweetId, page, limit) {
    try {
        const result = await this.commentRepository.getCommentsByTweet(
            tweetId,
            page,
            limit
        );

        return {
            comments: result.comments,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };

        } catch (error) {
            throw error;
        }
    }

}

module.exports = CommentService;
