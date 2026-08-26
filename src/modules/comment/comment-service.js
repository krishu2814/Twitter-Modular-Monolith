const CommentRepository = require('./comment-repository');
const TweetRepository = require('../tweet/tweet-repository');
const { publishEvent } = require('../../utils/producer');

class CommentService {
    constructor() {
        this.commentRepository = new CommentRepository();
        this.tweetRepository = new TweetRepository();
    }

    // create comment or reply
    async createComment(content, userId, tweetId, parentCommentId = null) {
        // 1) verify tweet exists
        const tweet = await this.tweetRepository.getTweetById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        // 2) if reply, verify parent comment exists
        let parentComment = null;
        if (parentCommentId) {
            parentComment = await this.commentRepository.getComment(parentCommentId);
            if (!parentComment) {
                throw new Error('Parent comment not found');
            }
        }

        // 3) create comment
        const comment = await this.commentRepository.createComment({
            content,
            user: userId,
            tweet: tweetId,
            parentComment: parentCommentId || null
        });

        // 4) increment tweet commentsCount
        await this.tweetRepository.incrementTweetComments(tweetId);

        // 5) publish notification event
        // If it's a reply to someone else's comment, notify the parent comment owner
        if (parentComment) {
            const parentOwnerId = parentComment.user && parentComment.user._id
                ? parentComment.user._id.toString()
                : parentComment.user.toString();

            if (parentOwnerId !== userId.toString()) {
                await publishEvent({
                    user: parentOwnerId,
                    actor: userId.toString(),
                    type: "COMMENT",
                    entityId: comment._id.toString()
                });
            }
        } else {
            // Top-level comment: notify tweet owner
            const tweetAuthorId = tweet.author && tweet.author._id
                ? tweet.author._id.toString()
                : tweet.author.toString();

            if (tweetAuthorId !== userId.toString()) {
                await publishEvent({
                    user: tweetAuthorId,
                    actor: userId.toString(),
                    type: "COMMENT",
                    entityId: comment._id.toString()
                });
            }
        }

        return comment;
    }

    // delete comment
    async deleteComment(commentId, userId) {
        // 1) check comment exists
        const comment = await this.commentRepository.getComment(commentId);
        if (!comment) {
            throw new Error('Comment not found!');
        }

        const commentOwner = comment.user && comment.user._id ? comment.user._id.toString() : comment.user.toString();
        const tweetOwner = comment.tweet && comment.tweet.author
            ? (comment.tweet.author._id ? comment.tweet.author._id.toString() : comment.tweet.author.toString())
            : null;

        // 2) check authorization (comment owner OR tweet owner)
        if (commentOwner !== userId.toString() && tweetOwner !== userId.toString()) {
            throw new Error("Unauthorized to delete this comment");
        }

        // 3) count and delete child replies if any
        const repliesCount = await this.commentRepository.countReplies(commentId);
        if (repliesCount > 0) {
            await this.commentRepository.deleteRepliesByParent(commentId);
        }

        // 4) delete comment and decrement tweet comments count
        const deletedComment = await this.commentRepository.deleteComment(commentId);
        const tweetId = comment.tweet._id || comment.tweet;
        await this.tweetRepository.decrementTweetComments(tweetId, 1 + repliesCount);

        return deletedComment;
    }

    // get top-level comments by tweet
    async getCommentByTweet(tweetId, page = 1, limit = 10) {
        const result = await this.commentRepository.getCommentsByTweet(tweetId, page, limit);

        return {
            comments: result.comments,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }

    // get replies to a comment
    async getReplies(parentCommentId, page = 1, limit = 10) {
        const parent = await this.commentRepository.getComment(parentCommentId);
        if (!parent) {
            throw new Error('Comment not found');
        }

        const result = await this.commentRepository.getRepliesByComment(parentCommentId, page, limit);

        return {
            replies: result.replies,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }

}

module.exports = CommentService;
