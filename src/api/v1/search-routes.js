const express = require('express');
const router = express.Router();

const SearchController = require('../../modules/search/search-controller');
const searchController = new SearchController();

// Search tweets: GET /api/v1/search/tweets?q=...
router.get('/tweets', searchController.searchTweets.bind(searchController));

// Search users: GET /api/v1/search/users?q=...
router.get('/users', searchController.searchUsers.bind(searchController));

module.exports = router;
