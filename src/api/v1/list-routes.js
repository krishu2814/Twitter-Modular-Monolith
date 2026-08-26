const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const ListController = require('../../modules/list/list-controller');
const listController = new ListController();

// Create list
router.post('/', authentication, listController.createList.bind(listController));

// Get my lists
router.get('/user/me', authentication, listController.getMyLists.bind(listController));

// Get list by id
router.get('/:id', authentication, listController.getList.bind(listController));

// Update list
router.patch('/:id', authentication, listController.updateList.bind(listController));

// Delete list
router.delete('/:id', authentication, listController.deleteList.bind(listController));

// Add member to list
router.post('/:id/members/:userId', authentication, listController.addMember.bind(listController));

// Remove member from list
router.delete('/:id/members/:userId', authentication, listController.removeMember.bind(listController));

// Get list tweets feed
router.get('/:id/tweets', authentication, listController.getListTweets.bind(listController));

module.exports = router;
