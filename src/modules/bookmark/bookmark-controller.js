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

    // ==========================================
    // 📁 BOOKMARK FOLDERS HANDLERS
    // ==========================================

    // POST /api/v1/bookmarks/folders
    async createFolder(req, res) {
        try {
            const userId = req.user._id;
            const folder = await this.bookmarkService.createFolder(userId, req.body);

            return res.status(201).json({
                status: "success",
                message: "Bookmark folder created successfully",
                data: folder,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to create bookmark folder",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/bookmarks/folders
    async getMyFolders(req, res) {
        try {
            const userId = req.user._id;
            const folders = await this.bookmarkService.getMyFolders(userId);

            return res.status(200).json({
                status: "success",
                message: "Bookmark folders fetched successfully",
                data: folders,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch bookmark folders",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/bookmarks/folders/:folderId
    async getFolderById(req, res) {
        try {
            const userId = req.user._id;
            const folderId = req.params.folderId;
            const folder = await this.bookmarkService.getFolderById(userId, folderId);

            return res.status(200).json({
                status: "success",
                message: "Bookmark folder fetched successfully",
                data: folder,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch bookmark folder",
                data: {},
                err: error.message
            });
        }
    }

    // PATCH /api/v1/bookmarks/folders/:folderId
    async updateFolder(req, res) {
        try {
            const userId = req.user._id;
            const folderId = req.params.folderId;
            const folder = await this.bookmarkService.updateFolder(userId, folderId, req.body);

            return res.status(200).json({
                status: "success",
                message: "Bookmark folder updated successfully",
                data: folder,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to update bookmark folder",
                data: {},
                err: error.message
            });
        }
    }

    // DELETE /api/v1/bookmarks/folders/:folderId
    async deleteFolder(req, res) {
        try {
            const userId = req.user._id;
            const folderId = req.params.folderId;
            await this.bookmarkService.deleteFolder(userId, folderId);

            return res.status(200).json({
                status: "success",
                message: "Bookmark folder deleted successfully",
                data: {},
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to delete bookmark folder",
                data: {},
                err: error.message
            });
        }
    }

    // POST /api/v1/bookmarks/folders/:folderId/tweets/:tweetId
    async addTweetToFolder(req, res) {
        try {
            const userId = req.user._id;
            const { folderId, tweetId } = req.params;
            const folder = await this.bookmarkService.addTweetToFolder(userId, folderId, tweetId);

            return res.status(200).json({
                status: "success",
                message: "Tweet added to bookmark folder successfully",
                data: folder,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to add tweet to bookmark folder",
                data: {},
                err: error.message
            });
        }
    }

    // DELETE /api/v1/bookmarks/folders/:folderId/tweets/:tweetId
    async removeTweetFromFolder(req, res) {
        try {
            const userId = req.user._id;
            const { folderId, tweetId } = req.params;
            const folder = await this.bookmarkService.removeTweetFromFolder(userId, folderId, tweetId);

            return res.status(200).json({
                status: "success",
                message: "Tweet removed from bookmark folder successfully",
                data: folder,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to remove tweet from bookmark folder",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/bookmarks/folders/:folderId/tweets
    async getFolderTweets(req, res) {
        try {
            const userId = req.user._id;
            const folderId = req.params.folderId;
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const limit = Math.min(50, parseInt(req.query.limit) || 10);

            const response = await this.bookmarkService.getFolderTweets(userId, folderId, page, limit);

            return res.status(200).json({
                status: "success",
                message: "Folder bookmark tweets fetched successfully",
                data: response,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch folder tweets",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = BookmarkController;
