const User = require('./user.model');

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
      return await User.findByIdAndUpdate(
          id,
          data,
          { new: true }); // to get updated data
  }

  async deleteUser(id) {
    return await User.findByIdAndDelete(id);
  }

}

module.exports = new UserRepository();
