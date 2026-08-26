const Block = require('./block-model');

class BlockRepository {

    // 1) create a block record
    async createBlock(blockerId, blockedId, session = null) {
        return await Block.create([{ blocker: blockerId, blocked: blockedId }], { session });
    }

    // 2) delete block record
    async removeBlock(blockerId, blockedId, session = null) {
        return await Block.findOneAndDelete({ blocker: blockerId, blocked: blockedId }, { session });
    }

    // 3) find existing block
    async findBlock(blockerId, blockedId, session = null) {
        return await Block.findOne({ blocker: blockerId, blocked: blockedId }, null, { session });
    }

    // 4) check if either user has blocked the other
    async isBlockedEither(userA, userB) {
        const block = await Block.findOne({
            $or: [
                { blocker: userA, blocked: userB },
                { blocker: userB, blocked: userA }
            ]
        });
        return !!block;
    }

    // 5) get all users blocked by a specific user
    async getBlockedUsers(userId) {
        return await Block.find({ blocker: userId }).populate('blocked', 'userName profileImage bio');
    }

    // 6) get list of IDs blocked by or blocking a user (for feed filtering)
    async getBlockedIds(userId) {
        const blocks = await Block.find({
            $or: [{ blocker: userId }, { blocked: userId }]
        });
        const ids = [];
        for (let b of blocks) {
            if (b.blocker.toString() === userId.toString()) {
                ids.push(b.blocked);
            } else {
                ids.push(b.blocker);
            }
        }
        return ids;
    }
}

module.exports = BlockRepository;
