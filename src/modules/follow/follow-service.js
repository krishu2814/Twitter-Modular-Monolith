const mongoose = require('mongoose');
const FollowRepository = require('./follow-repository');
const UserRepository = require('../user/user-repository');
const { publishEvent } = require('../../utils/producer');

class FollowService {
    constructor() {
        this.followRepository = new FollowRepository();
        this.userRepository = new UserRepository();
    }

    async toggleFollow(followerId, followingId) {
        if (followerId.toString() === followingId.toString()) {
            throw new Error('User cannot follow themselves.');
        }

        // Verify target user exists
        const targetUser = await this.userRepository.getUserById(followingId);
        if (!targetUser) {
            throw new Error('User to follow not found');
        }

        const session = await mongoose.startSession(); // start transaction session
        session.startTransaction();

        try {
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
            const newFollow = await this.followRepository.create({
                follower: followerId,
                following: followingId
            }, session);

            await this.userRepository.incrementFollowing(followerId, session);
            await this.userRepository.incrementFollowers(followingId, session);

            await session.commitTransaction();
            session.endSession();

            // Publish FOLLOW event
            try {
                await publishEvent({
                    user: followingId.toString(),   // ALWAYS STRING
                    actor: followerId.toString(),  // ALWAYS STRING
                    type: "FOLLOW",
                    entityId: newFollow._id.toString() // ALWAYS STRING
                });
            } catch (error) {
                console.error('❌ Failed to publish FOLLOW event:', error);
            }

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

    // REQUIRED FOR FEED MODULE
    async getFollowingIds(userId) {
        return await this.followRepository.getFollowingIds(userId);
    }
    
}

module.exports = FollowService;
