const express = require('express');
const router = express.Router();

const AuthController = require('../../modules/auth/auth-controller');
const authController = new AuthController();

router.post('/signup', authController.signup.bind(authController));

module.exports = router;

/**!SECTION
Client
   ↓
POST /api/v1/auth/signup
   ↓
Auth Controller
   ↓
Auth Service
   ↓
User Repository
   ↓
MongoDB
   ↓
JWT token generated
   ↓
Token returned to client

 */