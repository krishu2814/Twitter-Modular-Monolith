const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const BlockController = require('../../modules/block/block-controller');
const blockController = new BlockController();

// Toggle block user: POST /api/v1/blocks/toggle/:userId
router.post('/toggle/:userId', authentication, blockController.toggleBlock.bind(blockController));

// Get blocked users: GET /api/v1/blocks
router.get('/', authentication, blockController.getBlockedUsers.bind(blockController));

module.exports = router;
