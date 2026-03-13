const express = require('express');

const authentication = require('../../middlewares/auth-middleware');

const router = express.Router();
const CommentController = require('../../modules/comment/comment-controller');
const commentController = new CommentController();

/**
 * CREATE COMMENT
 * POST /comments/tweet/:tweetId
 */
router.post('/tweet/:tweetId', authentication, commentController.createComment.bind(commentController));

/**
 * DELETE COMMENT
 * DELETE /comments/:commentId
 */
router.delete('/:commentId', authentication, commentController.deleteComment.bind(commentController));

/**
 * GET COMMENTS OF A TWEET
 * GET /comments/tweet/:tweetId
 */
router.get('/tweet/:tweetId', commentController.getCommentsByTweet.bind(commentController));

module.exports = router;
