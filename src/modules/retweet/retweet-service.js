const mongoose = require('mongoose');
const RetweetRepository = require('./retweet-repository');
const Tweet = require('../tweet/tweet-model');
const { publishEvent } = require('../../utils/producer');

class RetweetService {
    constructor() {
        this.retweetRepository = new RetweetRepository();
    }

    async toggleRetweet(userId, tweetId) {
        // 1) check if tweet exists
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new Error("Tweet not found");
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 2) check if user already retweeted
            const alreadyRetweeted = await this.retweetRepository.findUserAndTweet(userId, tweetId, session);

            if (alreadyRetweeted) {
                // UN-RETWEET
                await this.retweetRepository.delete(alreadyRetweeted._id, session);
                await this.retweetRepository.decrementTweetRetweets(tweetId, session);

                await session.commitTransaction();
                session.endSession();

                return { retweeted: false };
            }

            // RETWEET
            const newRetweet = await this.retweetRepository.create({
                user: userId,
                tweet: tweetId
            }, session);

            await this.retweetRepository.incrementTweetRetweets(tweetId, session);

            await session.commitTransaction();
            session.endSession();

            // 3) publish RETWEET notification event (skip if user retweets own tweet)
            if (tweet.author.toString() !== userId.toString()) {
                await publishEvent({
                    user: tweet.author.toString(),   // target user (tweet owner)
                    actor: userId.toString(),        // user who performed retweet
                    type: "RETWEET",
                    entityId: newRetweet._id.toString()
                });
            }

            return { retweeted: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getRetweetsByTweet(tweetId) {
        return await this.retweetRepository.getRetweetsByTweet(tweetId);
    }

    async getRetweetsByUser(userId) {
        return await this.retweetRepository.getRetweetsByUser(userId);
    }
}

module.exports = RetweetService;
