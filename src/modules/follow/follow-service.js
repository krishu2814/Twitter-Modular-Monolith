const FollowRepository = require('./follow-repository');

class FollowService {
    constructor() {
        this.followRepository = new FollowRepository();
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
            if ( existingFollow ) {
                await this.followRepository.delete(existingFollow._id);
                return { following: false }; // user is not following
            }

            /**
             * If user is not following
             */
            const follow = await this.followRepository.create({
                follower: followerId,
                following: followingId
            });
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
