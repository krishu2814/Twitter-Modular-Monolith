const AuthService = require('./auth-service');

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    async signup(req, res) {

        try {

            const result = await this.authService.signUp(req.body);

            res.status(201).json({
                success: true,
                message: "User registered",
                data: result
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: error.message
            });

        }

    }
}

module.exports =  AuthController;