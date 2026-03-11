const UserRepository = require('../user/user-repository');
const bcrypt = require('bcrypt');
const { genSaltRounds } = require('../../config/serverConfig')


class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
    }
    async signUp (data) {
        // Role🤡

        // 1) extract login credentials
        const { userName, email, password } = data; // object destructuring

        // 2) check if user already exists
        // password -> return to user
        const user = await this.userRepository.findByEmail(email);
        if (user) {
            throw new Error("User already exists");
        };

        // 3) hash the password
        const hashedPassword = await bcrypt.hash(password, genSaltRounds);

        // 4) create user after hashing password
        const newUser = await this.userRepository.createUser({
            userName,
            email,
            password: hashedPassword
        });
        console.log(newUser);
        return newUser;
    }
}

module.exports = AuthService;