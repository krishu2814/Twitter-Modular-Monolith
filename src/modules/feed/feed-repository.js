const Tweet = require('../tweet/tweet-model');
const Follow = require('../follow/follow-model');
const mongoose = require('mongoose');

class FeedRepository {

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

        // 4. Pagination
        const skip = (page - 1) * limit;

        // 5. Fetch tweets (using 'author' field)
        const feedTweets = await Tweet.find({
            author: { $in: followingUserIds }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'userName profileImage')
        .lean();

        return feedTweets;
    }

}

module.exports = FeedRepository;
