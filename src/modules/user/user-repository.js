const User = require('./user-model');

class UserRepository {

    async createUser(data) {
        return await User.create(data);
    }

    async getUserById(id) {
        return await User.findById(id);
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
            { new: true } // return updated data
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
            { new: true, session }
        );
    }

    async incrementFollowing(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followingCount: 1 } },
            { new: true, session }
        );
    }

    async decrementFollowers(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followersCount: -1 } },
            { new: true, session }
        );
    }

    async incrementFollowers(userId, session = null) {
        return await User.findByIdAndUpdate(
            userId,
            { $inc: { followersCount: 1 } },
            { new: true, session }
        );
    }

}

module.exports = UserRepository;
