const FollowRepository = require('./follow-repository');
const UserRepository = require('../../modules/user/user-repository');

class FollowService {
    constructor() {
        this.followRepository = new FollowRepository();
        this.userRepository = new UserRepository();
    }

    async toggleFollow(followerId, followingId) {
        try {
            if (followerId === followingId) {
                throw new Error('User cannot follow themselves.');
            }

            /**
             * If user ia already following
             */
            const existingFollow = await this.followRepository.findFollow(followerId, followingId);
            if (existingFollow) {
                // UNFOLLOW
                await this.followRepository.delete(existingFollow._id);
                // decrement counts of both follower(who clicks FOLLOW button) and following
                await this.userRepository.decrementFollowing(followerId);
                await this.userRepository.decrementFollowers(followingId);
                return { following: false }; // user is not following
            }

            /**
             * If user is not following
             * FOLLOW
             */
            const follow = await this.followRepository.create({
                follower: followerId,
                following: followingId
            });
            // increment counts
            await this.userRepository.incrementFollowing(followerId);
            await this.userRepository.incrementFollowers(followingId);
            return { following: true };
        } catch (error) {
            throw error;
        }
    }

    async getFollowers(userId) {
        return await this.followRepository.getFollowers(userId)
    }

    async getFollowing(userId) {
        return await this.followRepository.getFollowing(userId);
    }

}

module.exports = FollowService;
