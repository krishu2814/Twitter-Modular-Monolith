const UserRepository = require('./user-repository');
const FollowRepository = require('../follow/follow-repository');
const BlockRepository = require('../block/block-repository');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
        this.followRepository = new FollowRepository();
        this.blockRepository = new BlockRepository();
    }

    async create(data) {
        const user = await this.userRepository.createUser(data);
        return user;
    }
    async delete(id) {
        const user = await this.userRepository.deleteUser(id);
        return user;
    }
    async update(id, data) {
        const user = await this.userRepository.updateUser(id, data);
        return user;
    }
    async find(id) {
        const user = await this.userRepository.getUserById(id);
        return user;
    }
    async findAll() {
        const users = await this.userRepository.getAllUsers();
        return users;
    }

    // Verify user profile & assign badge
    async verifyUser(id, isVerified = true, badgeType = 'BLUE') {
        const user = await this.userRepository.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return await this.userRepository.updateVerification(id, isVerified, badgeType);
    }

    // "Who to Follow" Graph-Based Recommendation Algorithm
    async getWhoToFollow(userId, limit = 5) {
        // 1) Get who user currently follows
        const followingIds = await this.followRepository.getFollowingIds(userId);
        const followingSet = new Set(followingIds.map(id => id.toString()));

        // 2) Get blocked user IDs
        const blockedIds = await this.blockRepository.getBlockedIds(userId);
        const blockedSet = new Set(blockedIds.map(id => id.toString()));

        // Exclude self, already followed, and blocked users
        const excludeSet = new Set([userId.toString(), ...followingSet, ...blockedSet]);

        // 3) Find 2nd degree connections (who do my friends follow?)
        const candidateScores = {}; // candidateId -> mutual count

        for (const friendId of followingIds) {
            const friendsFollowings = await this.followRepository.getFollowingIds(friendId);
            for (const candidateId of friendsFollowings) {
                const cIdStr = candidateId.toString();
                if (!excludeSet.has(cIdStr)) {
                    candidateScores[cIdStr] = (candidateScores[cIdStr] || 0) + 1;
                }
            }
        }

        // Sort candidates by mutual count descending
        const sortedCandidateIds = Object.keys(candidateScores).sort((a, b) => candidateScores[b] - candidateScores[a]);

        const results = [];
        for (const candidateId of sortedCandidateIds.slice(0, limit)) {
            const u = await this.userRepository.getUserById(candidateId);
            if (u) {
                results.push({
                    user: u,
                    mutualFriendsCount: candidateScores[candidateId]
                });
            }
        }

        // 4) Backfill with popular users if not enough second-degree recommendations
        if (results.length < limit) {
            const alreadyAdded = new Set([...excludeSet, ...results.map(r => r.user._id.toString())]);
            const popularUsers = await this.userRepository.getPopularUsers(Array.from(alreadyAdded), limit - results.length);
            for (const popUser of popularUsers) {
                results.push({
                    user: popUser,
                    mutualFriendsCount: 0
                });
            }
        }

        return results;
    }

    async updateUserPresence(id, isOnline) {
        return await this.userRepository.updateUserPresence(id, isOnline);
    }

    async getUserPresence(id) {
        const user = await this.userRepository.getUserPresence(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}

module.exports = UserService;
