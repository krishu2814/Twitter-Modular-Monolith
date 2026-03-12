const TweetRepository = require('./tweet-repository');

class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
    }

    async create(data) {
        return await this.tweetRepository.createTweet(data);
    }

    async delete(id) {
        return await this.tweetRepository.deleteTweet(id);
    }

    async update(id, data) {
        return await this.tweetRepository.updateTweet(id, data);
    }

    async get(id) {
        return await this.tweetRepository.getTweetById(id);
    }

    async getAll() {
        return await this.tweetRepository.getAllTweets();
    }
}

module.exports = TweetService;
