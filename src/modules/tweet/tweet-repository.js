const Tweet = require('./tweet-model');

class TweetRepository {

    async createTweet(data) {
        return await Tweet.create(data);
    }

    async getTweetById(id) {
        return await Tweet.findById(id);
    }

    async deleteTweet(id) {
        return await Tweet.findByIdAndDelete(id);
    }
    
    async getAllTweets() {
        return await Tweet.find();
    }
    
    async updateTweet(id, data) {
        return await Tweet.findByIdAndUpdate(
            id,
            data,
            { new: true } // return updated data
        );
    }
}

module.exports = TweetRepository;
