const SearchService = require('./search-service');

class SearchController {
    constructor() {
        this.searchService = new SearchService();
    }

    // GET /api/v1/search/tweets?q=...&page=1&limit=10
    async searchTweets(req, res) {
        try {
            const keyword = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const response = await this.searchService.searchTweets(keyword, page, limit);

            return res.status(200).json({
                status: "success",
                message: "Tweets searched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to search tweets",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/search/users?q=...&page=1&limit=10
    async searchUsers(req, res) {
        try {
            const keyword = req.query.q;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const response = await this.searchService.searchUsers(keyword, page, limit);

            return res.status(200).json({
                status: "success",
                message: "Users searched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to search users",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = SearchController;
