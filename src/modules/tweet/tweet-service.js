const TweetRepository = require('./tweet-repository');
const HashService = require('../hashtag/hashtag-service');

class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
        this.hashService = new HashService();
    }

    async create(data) {
        const tweet = await this.tweetRepository.createTweet(data);

        // Extract and process hashtags from content if present
        if (data.content) {
            const tags = data.content.match(/(#[a-zA-Z0-9_]+)/g);
            if (tags && tags.length > 0) {
                await this.hashService.processHashtagsFromTweet(tags, tweet._id);
            }
        }

        return tweet;
    }

    async delete(id, userId) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized to delete this tweet');
        }

        return await this.tweetRepository.deleteTweet(id);
    }

    async update(id, userId, data) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const authorId = tweet.author && tweet.author._id ? tweet.author._id.toString() : tweet.author.toString();
        if (authorId !== userId.toString()) {
            throw new Error('Unauthorized to update this tweet');
        }

        const updatedTweet = await this.tweetRepository.updateTweet(id, data);

        if (data.content) {
            const tags = data.content.match(/(#[a-zA-Z0-9_]+)/g);
            if (tags && tags.length > 0) {
                await this.hashService.processHashtagsFromTweet(tags, id);
            }
        }

        return updatedTweet;
    }

    async get(id) {
        const tweet = await this.tweetRepository.getTweetById(id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }
        return tweet;
    }

    async getAll() {
        return await this.tweetRepository.getAllTweets();
    }
}

module.exports = TweetService;
