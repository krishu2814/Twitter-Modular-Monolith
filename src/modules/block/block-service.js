const mongoose = require('mongoose');
const BlockRepository = require('./block-repository');
const UserRepository = require('../user/user-repository');
const FollowRepository = require('../follow/follow-repository');

class BlockService {
    constructor() {
        this.blockRepository = new BlockRepository();
        this.userRepository = new UserRepository();
        this.followRepository = new FollowRepository();
    }

    // 1) toggle block/unblock (ACID multi-document transaction)
    async toggleBlock(blockerId, blockedId) {
        if (blockerId.toString() === blockedId.toString()) {
            throw new Error('You cannot block yourself');
        }

        const targetUser = await this.userRepository.getUserById(blockedId);
        if (!targetUser) {
            throw new Error('User to block not found');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const existingBlock = await this.blockRepository.findBlock(blockerId, blockedId, session);

            if (existingBlock) {
                // UNBLOCK
                await this.blockRepository.removeBlock(blockerId, blockedId, session);

                await session.commitTransaction();
                session.endSession();

                return { blocked: false };
            }

            // BLOCK
            await this.blockRepository.createBlock(blockerId, blockedId, session);

            // Auto remove follow if blocker was following blocked
            const follow1 = await this.followRepository.findFollow(blockerId, blockedId, session);
            if (follow1) {
                await this.followRepository.delete(follow1._id, session);
                await this.userRepository.decrementFollowing(blockerId, session);
                await this.userRepository.decrementFollowers(blockedId, session);
            }

            // Auto remove follow if blocked was following blocker
            const follow2 = await this.followRepository.findFollow(blockedId, blockerId, session);
            if (follow2) {
                await this.followRepository.delete(follow2._id, session);
                await this.userRepository.decrementFollowing(blockedId, session);
                await this.userRepository.decrementFollowers(blockerId, session);
            }

            await session.commitTransaction();
            session.endSession();

            return { blocked: true };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // 2) get list of blocked users
    async getBlockedUsers(userId) {
        return await this.blockRepository.getBlockedUsers(userId);
    }
}

module.exports = BlockService;
