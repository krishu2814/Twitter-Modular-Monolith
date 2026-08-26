const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const MuteController = require('../../modules/mute/mute-controller');
const muteController = new MuteController();

// Toggle mute user: POST /api/v1/mutes/toggle/:userId
router.post('/toggle/:userId', authentication, muteController.toggleMute.bind(muteController));

// Get muted users: GET /api/v1/mutes
router.get('/', authentication, muteController.getMutedUsers.bind(muteController));

module.exports = router;
