const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');

const FollowController = require('../../modules/follow/follow-controller');
const followController = new FollowController();

// toggle follow -> id(in params)
router.post('/toggle/:id', authentication, followController.toggleFollow.bind(followController));

// get followers
router.get('/followers', authentication, followController.getFollowers.bind(followController));

// get following
router.get('/following', authentication, followController.getFollowing.bind(followController));

module.exports = router;
