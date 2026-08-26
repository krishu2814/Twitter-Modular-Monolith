const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const BookmarkController = require('../../modules/bookmark/bookmark-controller');
const bookmarkController = new BookmarkController();

// ==========================================
// 📁 BOOKMARK FOLDERS ROUTES
// ==========================================
router.post('/folders', authentication, bookmarkController.createFolder.bind(bookmarkController));
router.get('/folders', authentication, bookmarkController.getMyFolders.bind(bookmarkController));
router.get('/folders/:folderId', authentication, bookmarkController.getFolderById.bind(bookmarkController));
router.patch('/folders/:folderId', authentication, bookmarkController.updateFolder.bind(bookmarkController));
router.delete('/folders/:folderId', authentication, bookmarkController.deleteFolder.bind(bookmarkController));

router.post('/folders/:folderId/tweets/:tweetId', authentication, bookmarkController.addTweetToFolder.bind(bookmarkController));
router.delete('/folders/:folderId/tweets/:tweetId', authentication, bookmarkController.removeTweetFromFolder.bind(bookmarkController));
router.get('/folders/:folderId/tweets', authentication, bookmarkController.getFolderTweets.bind(bookmarkController));

// ==========================================
// 🔖 BASIC BOOKMARK ROUTES
// ==========================================
// Toggle bookmark: POST /api/v1/bookmarks/:tweetId
router.post('/:tweetId', authentication, bookmarkController.toggle.bind(bookmarkController));

// List user bookmarks: GET /api/v1/bookmarks
router.get('/', authentication, bookmarkController.getBookmarks.bind(bookmarkController));

module.exports = router;
