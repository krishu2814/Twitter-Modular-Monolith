const Tweet = require('../tweet/tweet-model');
const Follow = require('../follow/follow-model');
const BlockRepository = require('../block/block-repository');
const MuteRepository = require('../mute/mute-repository');
const mongoose = require('mongoose');

class FeedRepository {
    constructor() {
        this.blockRepository = new BlockRepository();
        this.muteRepository = new MuteRepository();
    }

    // add pagination to it and suggest changes to feed controller as well
    async getFeedTweetsFromUser(userId, page = 1, limit = 20) {
        // 1. Convert to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 2. Get following users
        // ObjectId("64f1a2b3c4d5e6f7890abcde")
        const follows = await Follow.find({ follower: userObjectId }).select('following');
        let followingUserIds = follows.map(f => f.following);

        // 3. Include self -> userId
        followingUserIds.push(userObjectId);

        // 4. Exclude blocked users (both users blocked by me and users who blocked me)
        const blockedIds = await this.blockRepository.getBlockedIds(userId);
        if (blockedIds && blockedIds.length > 0) {
            const blockedSet = new Set(blockedIds.map(id => id.toString()));
            followingUserIds = followingUserIds.filter(id => !blockedSet.has(id.toString()));
        }

        // 5. Exclude muted users
        const mutedIds = await this.muteRepository.getMutedIds(userId);
        if (mutedIds && mutedIds.length > 0) {
            const mutedSet = new Set(mutedIds.map(id => id.toString()));
            followingUserIds = followingUserIds.filter(id => !mutedSet.has(id.toString()));
        }

        // 6. Pagination
        const skip = (page - 1) * limit;

        // 7. Fetch tweets (using 'author' field)
        const feedTweets = await Tweet.find({
            author: { $in: followingUserIds }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'userName profileImage')
        .populate({
            path: 'quoteTweet',
            populate: {
                path: 'author',
                select: 'userName profileImage'
            }
        })
        .lean();

        return feedTweets;
    }

    // Fetch tweets authored exclusively by verified users
    async getVerifiedFeed(userId, page = 1, limit = 20) {
        const User = require('../user/user-model');
        const verifiedUsers = await User.find({ isVerified: true }).select('_id');
        let verifiedUserIds = verifiedUsers.map(u => u._id);

        // Exclude blocked & muted users
        if (userId) {
            const blockedIds = await this.blockRepository.getBlockedIds(userId);
            const mutedIds = await this.muteRepository.getMutedIds(userId);
            const excludeSet = new Set([...blockedIds.map(id => id.toString()), ...mutedIds.map(id => id.toString())]);
            verifiedUserIds = verifiedUserIds.filter(id => !excludeSet.has(id.toString()));
        }

        const skip = (page - 1) * limit;

        const tweets = await Tweet.find({ author: { $in: verifiedUserIds } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'userName profileImage isVerified badgeType bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage isVerified badgeType'
                }
            })
            .lean();

        return tweets;
    }

}

module.exports = FeedRepository;
