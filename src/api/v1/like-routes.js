const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const LikeController = require('../../modules/like/like-controller');
const likeController = new LikeController();

router.post('/:tweetId', authentication, likeController.toggle.bind(likeController));

module.exports = router;
