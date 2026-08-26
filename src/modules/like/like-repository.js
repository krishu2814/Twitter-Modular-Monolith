const Like = require('./like-model');
const Tweet = require('../tweet/tweet-model');

class LikeRepository {
    async create(data, session = null) {
        if (session) {
            const result = await Like.create([data], { session });
            return result[0];
        }
        return await Like.create(data);
    }

    async findUserIdAndTweetId(userId, tweetId, session = null) {
        const query = Like.findOne({
            user: userId,
            tweet: tweetId
        });
        if (session) {
            query.session(session);
        }
        return await query;
    }

    async delete(id, session = null) {
        return await Like.findByIdAndDelete(id, { session });
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

    async incrementTweetLikes(tweetId, session = null) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { likesCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async decrementTweetLikes(tweetId, session = null) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { likesCount: -1 } },
            { returnDocument: 'after', session }
        );
    }

}

module.exports = LikeRepository;
