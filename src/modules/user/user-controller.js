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
                message: "Something went wrong while updating the user.",
                data: {},
                err: error
            });
        }
    }

    async delete(req, res) {
        try {
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
                message: "Something went wrong while deleting the user.",
                data: {},
                err: error
            });
        }
    }

    async get(req, res) {
        try {
            const user = await this.userService.find(req.params.id);

            return res.status(200).json({
                status: "success",
                message: "Successfully fetched the user.",
                data: user,
                err: {}
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Something went wrong while fetching the user.",
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
}

module.exports = UserController;
