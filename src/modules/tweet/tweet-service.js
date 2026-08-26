const TweetRepository = require('./tweet-repository');
const HashService = require('../hashtag/hashtag-service');
const { publishEvent } = require('../../utils/producer');

class TweetService {
    constructor() {
        this.tweetRepository = new TweetRepository();
        this.hashService = new HashService();
    }

    async create(data) {
        // 1) if this is a quote tweet, check if original tweet exists
        let originalTweet = null;
        if (data.quoteTweet) {
            originalTweet = await this.tweetRepository.getTweetById(data.quoteTweet);
            if (!originalTweet) {
                throw new Error('Quoted tweet not found');
            }
        }

        // 2) create the new tweet
        const tweet = await this.tweetRepository.createTweet(data);

        // 3) if quote tweet, increment retweetsCount on quoted tweet & publish event
        if (data.quoteTweet && originalTweet) {
            await this.tweetRepository.updateTweet(data.quoteTweet, { $inc: { retweetsCount: 1 } });

            const originalAuthorId = originalTweet.author && originalTweet.author._id 
                ? originalTweet.author._id.toString() 
                : originalTweet.author.toString();

            // publish RETWEET event (skip if quoting self)
            if (originalAuthorId !== data.author.toString()) {
                await publishEvent({
                    user: originalAuthorId,
                    actor: data.author.toString(),
                    type: "RETWEET",
                    entityId: tweet._id.toString()
                });
            }
        }

        // 4) extract and process hashtags from content if present
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

    async getTweetsByUser(userId, page = 1, limit = 10) {
        const result = await this.tweetRepository.getTweetsByUser(userId, page, limit);
        return {
            tweets: result.tweets,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }
}

module.exports = TweetService;
