const AuthService = require('./auth-service');

class AuthController {
    constructor() {
        this.authService = new AuthService();
    }

    // sign up the user
    async signup(req, res) {

        try {

            const result = await this.authService.signUp(req.body);

            res.status(200).json({
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

    // sign in the user
    async signIn(req, res) {

        try {

            const result = await this.authService.signIn(req.body);

            res.status(201).json({
                success: true,
                message: "User Signed In successfully.",
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

module.exports = AuthController;
