const JWT = require('jsonwebtoken');
const { SECRET_TOKEN } = require('../config/serverConfig');
const UserRepository = require('../modules/user/user-repository');

const isUserAuthentic = async (req, res, next) => {
    try {
        // 1) Get token from Authorization header
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token missing or malformed'
            });
        }

        const token = authHeader.split(' ')[1];

        // 2️) Verify token
        const decoded = JWT.verify(token, SECRET_TOKEN);

        // 3️) Attach user to request
        const userRepository = new UserRepository();
        const user = await userRepository.getUserById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4) if user found -> // hide password
        user.password = undefined;

        // 5) MOST IMPORTANT💥
        req.user = user; // attach user to request

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error.message
        });
    }
};

module.exports = isUserAuthentic;
