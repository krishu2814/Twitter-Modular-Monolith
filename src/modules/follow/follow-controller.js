const FollowService = require('./follow-service');

class FollowController {
    constructor() {
        this.followService = new FollowService();
    }

    async toggleFollow(req, res) {
        try {
            const followerId = req.user._id; // user is the follower -> authentication
            const followingId = req.params.id; // to whom the user follows

            const toggleFollow = await this.followService.toggleFollow(followerId, followingId);
            console.log(toggleFollow);
            
            return res.status(200).json({
                status: "success",
                message: `Follow toggled successfully.`,
                data: toggleFollow,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "false",
                message: "Cannot toggle follow.",
                data: {},
                err: error.message
            });
        }
    }

    async getFollowers(req, res) {
        try {
            const followers = await this.followService.getFollowers(req.user.id);
            return res.status(200).json({
                    status: "success",
                    message: "Successfully fetched followers.",
                    data: followers,
                    err: {}
            });   
        } catch (error) {
            return res.status(500).json({
                status: "false",
                message: "Cannot fetch followers.",
                data: {},
                err: error.message
            });
        }
    }

    async getFollowing(req, res) {
        try {
            const following = await this.followService.getFollowing(req.user.id);
            return res.status(200).json({
                    status: "success",
                    message: "Successfully fetched following.",
                    data: following,
                    err: {}
            });   
        } catch (error) {
            return res.status(500).json({
                status: "false",
                message: "Cannot fetch following.",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = FollowController;
