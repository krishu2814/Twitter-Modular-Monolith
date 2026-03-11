const UserRepository = require('../user/user-repository');
const bcrypt = require('bcrypt');
const { SALT_ROUNDS, SECRET_TOKEN, EXPIRES_IN } = require('../../config/serverConfig');
const JWT = require('jsonwebtoken');


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
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4) create user after hashing password
        const newUser = await this.userRepository.createUser({
            userName,
            email,
            password: hashedPassword
        });

        // 5) create JWT token -> synchronous function -> no await needed
        const token = JWT.sign({ id: newUser._id, email: newUser.email }, SECRET_TOKEN, { expiresIn: EXPIRES_IN });

        // 6) remove password before sending new user
        newUser.password = undefined;
        return { newUser, token };
        
    }

    async signIn(data) {
        try {
            // 1) extract login credentials
            const { email, password } = data;

            // 2) find user from database
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                throw new Error("No user exists with this email.")
            }

            // 3) compare password with hashed password stored in the database -> bcrypt
            // 2nd argument -> hashed password stored in DB
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                throw new Error("Wrong passsword enterrd by user!")
            }

            // 4) create JWT token -> synchronous function -> no await needed
            const token = JWT.sign({ id: user._id, email: user.email }, SECRET_TOKEN, { expiresIn: EXPIRES_IN });

            // 5) removed password
            user.password = undefined;

            return { user, token };
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = AuthService;
