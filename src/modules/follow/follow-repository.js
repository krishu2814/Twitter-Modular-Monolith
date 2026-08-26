const Follow = require('./follow-model');

class FollowRepository {

    async create(data, session = null) {
        const result = await Follow.create([data], {session});
        return result[0];
    }

    async findFollow(followerId, followingId, session = null) {
        const query = Follow.findOne({
            follower: followerId,
            following: followingId
        });
        if (session) {
            query.session(session);
        }
        return await query;
    }

    async delete(id, session = null) {
        return await Follow.findByIdAndDelete(id, { session });
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
        }).populate('follower', 'userName email profileImage bio');
    }

    async getFollowing(userId) {
        return await Follow.find({
            follower: userId // find where follower = A
        }).populate('following', 'userName email profileImage bio');
    }

    async getFollowingIds(userId) {
        const following = await Follow.find({
            follower: userId
        }).select('following');

        return following.map(f => f.following);
    }
}

module.exports = FollowRepository;
