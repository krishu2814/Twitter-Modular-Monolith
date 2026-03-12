const Like = require('../../modules/like/like-model');

class LikeRepository {
    async create(data) {
        return await Like.create(data);
    }

    async findUserIdAndTweetId(userId, tweetId) {
        return await Like.findOne({
            // as per Like model
            user: userId,
            tweet: tweetId
        });
    }

    async delete(id) {
        return await Like.findByIdAndDelete(id);
    }

    // tweet page || like count
    async getIdByTweet(tweetId) {
        return await Like.find({
            tweet: tweetId
        });
    }

    // Profile → Likes section
    async getIdByUser(userId) {
        return await Like.find({
            user: userId
        });
    }
}

module.exports = LikeRepository;
