const Tweet = require('./tweet-model');

class TweetRepository {

    async createTweet(data) {
        return await Tweet.create(data);
    }

    async getTweetById(id) {
        return await Tweet.findById(id).populate('author', 'userName profileImage bio');
    }

    async deleteTweet(id) {
        return await Tweet.findByIdAndDelete(id);
    }
    
    async getAllTweets() {
        return await Tweet.find().sort({ createdAt: -1 }).populate('author', 'userName profileImage bio');
    }
    
    async updateTweet(id, data) {
        return await Tweet.findByIdAndUpdate(
            id,
            data,
            { returnDocument: 'after' }
        );
    }
}

module.exports = TweetRepository;
