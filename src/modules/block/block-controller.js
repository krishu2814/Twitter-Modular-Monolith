const BlockService = require('./block-service');

class BlockController {
    constructor() {
        this.blockService = new BlockService();
    }

    // POST /api/v1/blocks/toggle/:userId
    async toggleBlock(req, res) {
        try {
            const blockerId = req.user._id;
            const blockedId = req.params.userId;

            const result = await this.blockService.toggleBlock(blockerId, blockedId);

            return res.status(200).json({
                status: "success",
                message: result.blocked ? "User blocked successfully" : "User unblocked successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while toggling block status",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/blocks
    async getBlockedUsers(req, res) {
        try {
            const userId = req.user._id;
            const result = await this.blockService.getBlockedUsers(userId);

            return res.status(200).json({
                status: "success",
                message: "Blocked users fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching blocked users",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = BlockController;
