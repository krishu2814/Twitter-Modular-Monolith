const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const BookmarkController = require('../../modules/bookmark/bookmark-controller');
const bookmarkController = new BookmarkController();

// Toggle bookmark: POST /api/v1/bookmarks/:tweetId
router.post('/:tweetId', authentication, bookmarkController.toggle.bind(bookmarkController));

// List user bookmarks: GET /api/v1/bookmarks
router.get('/', authentication, bookmarkController.getBookmarks.bind(bookmarkController));

module.exports = router;
