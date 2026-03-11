const express = require('express');
const router = express.Router();

const UserController = require('../../modules/user/user-controller');

const userController = new UserController();

/**
 * bind() -> for this keyword
 */

// create user
router.post('/', userController.create.bind(userController));

// get all users
router.get('/', userController.getAll.bind(userController));

// get user by id
router.get('/:id', userController.get.bind(userController));

// update user
router.patch('/:id', userController.update.bind(userController));

// delete user
router.delete('/:id', userController.delete.bind(userController));

module.exports = router;
