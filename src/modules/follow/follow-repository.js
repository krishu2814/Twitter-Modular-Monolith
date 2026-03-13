const Follow = require('./follow-model');

class FollowRepository {

    async create(data) {
        return await Follow.create(data);
    }

    async findFollow(followerId, followingId) {
        return await Follow.findOne({
            follower: followerId,
            following: followingId
        });
    }

    async delete(id) {
        return await Follow.findByIdAndDelete(id);
    }

    /**
     * A follows B
     * Followers = people who follow you -> A
     * Following = people whom you follow -> B
     * Followers of B = [A]
     * Following of A = [B]
     */
    
    // find all followers of A -> A is following whom???
    async getFollowers(userId) {
        return await Follow.find({
            following: userId // find where following = B
        }).populate('follower', 'username email');
    }

    async getFollowing(userId) {
        return await Follow.find({
            follower: userId // find where follower = A
        }).populate('following', 'username email');
    }
}

module.exports = FollowRepository;
