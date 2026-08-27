const UserService = require('./user-service');

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async create(req, res) {
        
        try {
            const user = await this.userService.create(req.body);

            return res.status(201).json({
                status: "success",
                message: "Successfully created the user.",
                data: user,
                err: {}
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Something went wrong while creating the user.",
                data: {},
                err: error
            });
        }
    }

    async update(req, res) {
        try {
            if (req.user._id.toString() !== req.params.id) {
                return res.status(403).json({
                    status: "error",
                    message: "You can only update your own account.",
                    data: {},
                    err: {}
                });
            }

            const user = await this.userService.update(req.params.id, req.body);

            return res.status(200).json({
                status: "success",
                message: "Successfully updated the user.",
                data: user,
                err: {}
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while updating the user.",
                data: {},
                err: error
            });
        }
    }

    async delete(req, res) {
        try {
            if (req.user._id.toString() !== req.params.id) {
                return res.status(403).json({
                    status: "error",
                    message: "You can only delete your own account.",
                    data: {},
                    err: {}
                });
            }

            const user = await this.userService.delete(req.params.id);

            return res.status(200).json({
                status: "success",
                message: "Successfully deleted the user.",
                data: user,
                err: {}
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while deleting the user.",
                data: {},
                err: error
            });
        }
    }

    async get(req, res) {
        try {
            const user = await this.userService.find(req.params.id);
            if (!user) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found.",
                    data: {},
                    err: {}
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Successfully fetched the user.",
                data: user,
                err: {}
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching the user.",
                data: {},
                err: error
            });
        }
    }

    async getAll(req, res) {
        try {
            const users = await this.userService.findAll();

            return res.status(200).json({
                status: "success",
                message: "Successfully fetched all users.",
                data: users,
                err: {}
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Something went wrong while fetching users.",
                data: {},
                err: error
            });
        }
    }

    // PATCH /api/v1/users/:id/verify
    async verifyUser(req, res) {
        try {
            const { isVerified, badgeType } = req.body;
            const user = await this.userService.verifyUser(req.params.id, isVerified !== false, badgeType || 'BLUE');

            return res.status(200).json({
                status: "success",
                message: "User verification status updated successfully.",
                data: user,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while verifying user.",
                data: {},
                err: error
            });
        }
    }

    // GET /api/v1/users/recommendations/who-to-follow
    async getWhoToFollow(req, res) {
        try {
            const userId = req.user._id;
            const limit = parseInt(req.query.limit) || 5;
            const result = await this.userService.getWhoToFollow(userId, limit);

            return res.status(200).json({
                status: "success",
                message: "Who-to-follow recommendations fetched successfully.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching recommendations.",
                data: {},
                err: error
            });
        }
    }

    // GET /api/v1/users/:id/presence
    async getPresence(req, res) {
        try {
            const presence = await this.userService.getUserPresence(req.params.id);
            return res.status(200).json({
                status: "success",
                message: "User presence fetched successfully.",
                data: presence,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Something went wrong while fetching user presence.",
                data: {},
                err: error
            });
        }
    }
}

module.exports = UserController;
