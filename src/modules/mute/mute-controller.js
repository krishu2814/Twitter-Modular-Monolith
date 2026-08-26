const MuteService = require('./mute-service');

class MuteController {
    constructor() {
        this.muteService = new MuteService();
    }

    // POST /api/v1/mutes/toggle/:userId
    async toggleMute(req, res) {
        try {
            const muterId = req.user._id;
            const mutedId = req.params.userId;

            const result = await this.muteService.toggleMute(muterId, mutedId);

            return res.status(200).json({
                status: "success",
                message: result.muted ? "User muted successfully" : "User unmuted successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while toggling mute status",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/mutes
    async getMutedUsers(req, res) {
        try {
            const userId = req.user._id;
            const result = await this.muteService.getMutedUsers(userId);

            return res.status(200).json({
                status: "success",
                message: "Muted users fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching muted users",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = MuteController;
