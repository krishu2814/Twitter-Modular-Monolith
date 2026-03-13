const mongoose = require('mongoose');
const FollowRepository = require('./follow-repository');
const UserRepository = require('../../modules/user/user-repository');

class FollowService {
    constructor() {
        this.followRepository = new FollowRepository();
        this.userRepository = new UserRepository();
    }

    async toggleFollow(followerId, followingId) {
        const session = await mongoose.startSession(); // start transaction session
        session.startTransaction();

        try {
            if (followerId === followingId) {
                throw new Error('User cannot follow themselves.');
            }

            // Check if already following
            const existingFollow = await this.followRepository.findFollow(followerId, followingId, session);
            if (existingFollow) {
                // UNFOLLOW
                await this.followRepository.delete(existingFollow._id, session);
                await this.userRepository.decrementFollowing(followerId, session);
                await this.userRepository.decrementFollowers(followingId, session);

                await session.commitTransaction();
                session.endSession();

                return { following: false };
            }

            // FOLLOW
            await this.followRepository.create({
                follower: followerId,
                following: followingId
            }, session);

            await this.userRepository.incrementFollowing(followerId, session);
            await this.userRepository.incrementFollowers(followingId, session);

            await session.commitTransaction();
            session.endSession();

            return { following: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getFollowers(userId) {
        return await this.followRepository.getFollowers(userId);
    }

    async getFollowing(userId) {
        return await this.followRepository.getFollowing(userId);
    }
    
}

module.exports = FollowService;
