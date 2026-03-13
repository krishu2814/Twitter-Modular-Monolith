const mongoose = require('mongoose');
const LikeRepository = require('./like-repository');

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
            await this.likeRepository.create({ user: userId, tweet: tweetId }, session);
            await this.likeRepository.incrementTweetLikes(tweetId, session);

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
