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
        { new: true }); // to get updated data
    }

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    }
    
    async findByEmail(email) {
        return await User.findOne({
            // email: email,
            email // ES6
        }).select("+password");
    }

}

module.exports = UserRepository;
