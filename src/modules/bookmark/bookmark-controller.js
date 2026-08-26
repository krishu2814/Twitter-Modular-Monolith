const BookmarkService = require('./bookmark-service');

class BookmarkController {
    constructor() {
        this.bookmarkService = new BookmarkService();
    }

    // POST /api/v1/bookmarks/:tweetId
    async toggle(req, res) {
        try {
            const userId = req.user._id;
            const tweetId = req.params.tweetId;

            const response = await this.bookmarkService.toggleBookmark(userId, tweetId);

            return res.status(200).json({
                status: "success",
                message: "Bookmark toggled successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to toggle bookmark",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/bookmarks?page=1&limit=10
    async getBookmarks(req, res) {
        try {
            const userId = req.user._id;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, parseInt(req.query.limit) || 10);

            const response = await this.bookmarkService.getBookmarks(userId, page, limit);

            return res.status(200).json({
                status: "success",
                message: "Bookmarks fetched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch bookmarks",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = BookmarkController;
