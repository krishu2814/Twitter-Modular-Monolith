const Comment = require('./comment-model');

class CommentRepository {
    
    // create comment
    async createComment(data) {
        return await Comment.create(data);
    }

    // delete comment
    async deleteComment(id) {
        return await Comment.findByIdAndDelete(id);
    }

    // delete all replies of a comment
    async deleteRepliesByParent(parentCommentId) {
        return await Comment.deleteMany({ parentComment: parentCommentId });
    }

    // count replies of a comment
    async countReplies(parentCommentId) {
        return await Comment.countDocuments({ parentComment: parentCommentId });
    }

    // update comment
    async updateComment(id, data) {
        return await Comment.findByIdAndUpdate(
            id,
            data,
            { returnDocument: 'after' }
        );
    }

    // find comment by id
    async getComment(id) {
        return await Comment.findById(id).populate('tweet').populate('parentComment');
    }

    // find top-level comments by tweet
    async getCommentsByTweet(tweetId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const comments = await Comment.find({
            tweet: tweetId,
            parentComment: null
        })
            .skip(skip)
            .limit(limit)
            .populate('user', 'userName profileImage email')
            .populate('tweet', 'content author')
            .sort({ createdAt: -1 });

        const total = await Comment.countDocuments({ tweet: tweetId, parentComment: null });
        return {
            comments,
            total
        };
    }

    // find replies to a comment
    async getRepliesByComment(parentCommentId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const replies = await Comment.find({
            parentComment: parentCommentId
        })
            .skip(skip)
            .limit(limit)
            .populate('user', 'userName profileImage email')
            .sort({ createdAt: 1 });

        const total = await Comment.countDocuments({ parentComment: parentCommentId });
        return {
            replies,
            total
        };
    }
    
}

module.exports = CommentRepository;
