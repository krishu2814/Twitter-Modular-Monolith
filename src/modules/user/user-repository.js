const User = require('./user-model');

class UserRepository {

    async createUser(data) {
        return await User.create(data);
    }

    async getUserById(id) {
        return await User.findById(id).populate('pinnedTweet');
    }

    async getAllUsers() {
        return await User.find();
    }

    async updateUser(id, data) {
        // cannot update password
        if (data.password) {
            delete data.password;
        }
        return await User.findByIdAndUpdate(
            id,
            data,
            { returnDocument: 'after' }
        );
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }
    
    async findByEmail(email) {
        return await User.findOne({ email }).select("+password");
    }

    // ---- Followers/Following counts ----
    // Session is only needed when called inside FollowService transaction
    async decrementFollowing(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followingCount: -1 } },
            { returnDocument: 'after', session }
        );
    }

    async incrementFollowing(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followingCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async decrementFollowers(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followersCount: -1 } },
            { returnDocument: 'after', session }
        );
    }

    async incrementFollowers(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followersCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async getUserByUsername(userName) {
        return await User.findOne({ userName });
    }

    async setPinnedTweet(userId, tweetId) {
        return await User.findByIdAndUpdate(
            userId,
            { pinnedTweet: tweetId },
            { returnDocument: 'after' }
        );
    }

    async clearPinnedTweet(userId) {
        return await User.findByIdAndUpdate(
            userId,
            { pinnedTweet: null },
            { returnDocument: 'after' }
        );
    }

    async updateVerification(userId, isVerified = true, badgeType = 'BLUE') {
        return await User.findByIdAndUpdate(
            userId,
            { isVerified, badgeType },
            { returnDocument: 'after' }
        );
    }

    async getPopularUsers(excludeIds = [], limit = 5) {
        return await User.find({ _id: { $nin: excludeIds } })
            .sort({ followersCount: -1 })
            .limit(limit)
            .select('userName profileImage bio followersCount followingCount isVerified badgeType');
    }

    async updateUserPresence(userId, isOnline) {
        const updateData = { isOnline };
        if (!isOnline) {
            updateData.lastSeen = new Date();
        }
        return await User.findByIdAndUpdate(
            userId,
            updateData,
            { returnDocument: 'after' }
        ).select('userName isOnline lastSeen');
    }

    async getUserPresence(userId) {
        return await User.findById(userId).select('userName isOnline lastSeen');
    }

}

module.exports = UserRepository;
