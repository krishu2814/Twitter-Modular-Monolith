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
            const tweet = await this.tweetRepository.getTweetById(tweetId);
            if (!tweet) {
                throw new Error('Tweet not found');
            }

            const comment = await this.commentRepository.createComment({
                content,
                user: userId,
                tweet: tweetId
            });

            const tweetAuthorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
            if (tweetAuthorId !== userId.toString()) {
                try {
                    await publishEvent({
                        user: tweetAuthorId,     // tweet owner
                        actor: userId.toString(),          // commenter
                        type: "COMMENT",
                        entityId: comment._id.toString()
                    });
                } catch (eventErr) {
                    console.error('❌ Failed to publish COMMENT event:', eventErr);
                }
            }
            return comment;
        } catch (error) {
            throw error;
        }
    }

    async deleteComment(commentId, userId) {
        // get comment + tweet owner (already populated by repository)
        const comment = await this.commentRepository.getComment(commentId);

        if (!comment) {
            throw new Error('Comment not found!');
        }

        const commentOwner = comment.user && comment.user._id ? comment.user._id.toString() : comment.user.toString();
        const tweetOwner = comment.tweet && comment.tweet.author
            ? (comment.tweet.author._id ? comment.tweet.author._id.toString() : comment.tweet.author.toString())
            : null;

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
