const express = require('express');
const router = express.Router();

const UserController = require('../../modules/user/user-controller');
const authentication = require('../../middlewares/auth-middleware');

const userController = new UserController();

/**
 * bind() -> for this keyword
 */

// create user
// router.post('/', userController.create.bind(userController)); -> AUTH MODULE

// get all users
router.get('/', authentication, userController.getAll.bind(userController));

// get user by id
router.get('/:id', authentication, userController.get.bind(userController));

// update user
router.patch('/:id', authentication, userController.update.bind(userController));

// delete user
router.delete('/:id', authentication, userController.delete.bind(userController));

module.exports = router;
