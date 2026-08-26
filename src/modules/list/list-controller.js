const ListService = require('./list-service');

class ListController {
    constructor() {
        this.listService = new ListService();
    }

    // POST /api/v1/lists
    async createList(req, res) {
        try {
            const ownerId = req.user._id;
            const result = await this.listService.createList(ownerId, req.body);

            return res.status(201).json({
                status: "success",
                message: "List created successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while creating list",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/lists/:id
    async getList(req, res) {
        try {
            const requesterId = req.user ? req.user._id : null;
            const result = await this.listService.getListById(req.params.id, requesterId);

            return res.status(200).json({
                status: "success",
                message: "List fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching list",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/lists/user/me
    async getMyLists(req, res) {
        try {
            const ownerId = req.user._id;
            const result = await this.listService.getUserLists(ownerId);

            return res.status(200).json({
                status: "success",
                message: "User lists fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching user lists",
                data: {},
                err: error.message
            });
        }
    }

    // PATCH /api/v1/lists/:id
    async updateList(req, res) {
        try {
            const ownerId = req.user._id;
            const result = await this.listService.updateList(req.params.id, ownerId, req.body);

            return res.status(200).json({
                status: "success",
                message: "List updated successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while updating list",
                data: {},
                err: error.message
            });
        }
    }

    // DELETE /api/v1/lists/:id
    async deleteList(req, res) {
        try {
            const ownerId = req.user._id;
            await this.listService.deleteList(req.params.id, ownerId);

            return res.status(200).json({
                status: "success",
                message: "List deleted successfully",
                data: {},
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while deleting list",
                data: {},
                err: error.message
            });
        }
    }

    // POST /api/v1/lists/:id/members/:userId
    async addMember(req, res) {
        try {
            const ownerId = req.user._id;
            const { id: listId, userId: memberId } = req.params;
            const result = await this.listService.addMember(listId, ownerId, memberId);

            return res.status(200).json({
                status: "success",
                message: "Member added to list successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while adding member",
                data: {},
                err: error.message
            });
        }
    }

    // DELETE /api/v1/lists/:id/members/:userId
    async removeMember(req, res) {
        try {
            const ownerId = req.user._id;
            const { id: listId, userId: memberId } = req.params;
            const result = await this.listService.removeMember(listId, ownerId, memberId);

            return res.status(200).json({
                status: "success",
                message: "Member removed from list successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while removing member",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/lists/:id/tweets
    async getListTweets(req, res) {
        try {
            const requesterId = req.user ? req.user._id : null;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;

            const result = await this.listService.getListTweets(req.params.id, requesterId, page, limit);

            return res.status(200).json({
                status: "success",
                message: "List tweets feed fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching list tweets",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = ListController;
