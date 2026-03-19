const mongoose = require('mongoose');
const LikeRepository = require('./like-repository');
const Tweet = require('../tweet/tweet-model');
const { publishEvent } = require('../../utils/producer');

class LikeService {
    constructor() {
        this.likeRepository = new LikeRepository();
    }

    async toggleLike(userId, tweetId) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // check if user already liked
            const alreadyLiked = await this.likeRepository.findUserIdAndTweetId(userId, tweetId);

            if (alreadyLiked) {
                // UNLIKE
                await this.likeRepository.delete(alreadyLiked._id, session);
                await this.likeRepository.decrementTweetLikes(tweetId, session);

                await session.commitTransaction();
                session.endSession();
                return { liked: false };
            }

            // If user not liked it
            // LIKE
            const newLike = await this.likeRepository.create({ user: userId, tweet: tweetId }, session);
            await this.likeRepository.incrementTweetLikes(tweetId, session);

            // Get tweet owner
            const tweet = await Tweet.findById(tweetId);

            // Publish LIKE notification event
            await publishEvent({
                user: tweet.author.toString(),   // receiver (tweet owner)
                actor: userId.toString(),        // who liked
                type: "LIKE",
                entityId: newLike._id.toString()
            });

            await session.commitTransaction();
            session.endSession();
            return { liked: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = LikeService;
