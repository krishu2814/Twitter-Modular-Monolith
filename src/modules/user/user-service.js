const UserRepository = require('./user-repository');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async create(data) {
        const user = await this.userRepository.createUser(data);
        return user;
    }
    async delete(id) {
        const user = await this.userRepository.deleteUser(id);
        return user;
    }
    async update(id, data) {
        const user = await this.userRepository.updateUser(id, data);
        return user;
    }
    async find(id) {
        const user = await this.userRepository.getUserById(id);
        return user;
    }
    async findAll() {
        const users = await this.userRepository.getAllUsers();
        return users;
    }
}

module.exports = UserService;
