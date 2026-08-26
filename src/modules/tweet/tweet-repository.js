const Tweet = require('./tweet-model');

class TweetRepository {

    async createTweet(data) {
        return await Tweet.create(data);
    }

    async getTweetById(id) {
        return await Tweet.findById(id)
            .populate('author', 'userName profileImage bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage bio'
                }
            });
    }

    async deleteTweet(id) {
        return await Tweet.findByIdAndDelete(id);
    }
    
    async getAllTweets() {
        return await Tweet.find()
            .sort({ createdAt: -1 })
            .populate('author', 'userName profileImage bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage bio'
                }
            });
    }
    
    async updateTweet(id, data) {
        return await Tweet.findByIdAndUpdate(
            id,
            data,
            { returnDocument: 'after' }
        );
    }

    async incrementTweetComments(id, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { commentsCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async decrementTweetComments(id, count = 1, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { commentsCount: -count } },
            { returnDocument: 'after', session }
        );
    }

    async incrementTweetBookmarks(id, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { bookmarksCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async decrementTweetBookmarks(id, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { bookmarksCount: -1 } },
            { returnDocument: 'after', session }
        );
    }
}

module.exports = TweetRepository;
