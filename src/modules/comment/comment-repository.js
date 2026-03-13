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

    // update comment
    async updateComment(id, data) {
        return await Comment.findByIdAndUpdate(
            id,
            data,
            { new: true } // return updated document
        );
    }

    // find comment by id
    async getComment(id) {
        return await Comment.findById(id);
    }

    // find comments by tweet
    async getCommentsByTweet(tweetId) {
        // populate user(only userName and Email) based on user's tweetId
        return await Comment.find({
            tweet: tweetId
        })
        .populate('user', 'userName email')
        .populate('tweet', 'content author')
        .sort({ createdAt: -1 }) 
    }
    
}

module.exports = CommentRepository;
