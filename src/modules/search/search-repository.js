const Tweet = require('../tweet/tweet-model');
const User = require('../user/user-model');

class SearchRepository {

    // search tweets containing keyword
    async searchTweets(keyword, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const tweets = await Tweet.find({
            content: { $regex: keyword, $options: 'i' }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'userName profileImage bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage bio'
                }
            });

        const total = await Tweet.countDocuments({
            content: { $regex: keyword, $options: 'i' }
        });

        return { tweets, total };
    }

    // search users by username or bio
    async searchUsers(keyword, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const users = await User.find({
            $or: [
                { userName: { $regex: keyword, $options: 'i' } },
                { bio: { $regex: keyword, $options: 'i' } }
            ]
        })
            .skip(skip)
            .limit(limit)
            .select('userName email profileImage bio followersCount followingCount');

        const total = await User.countDocuments({
            $or: [
                { userName: { $regex: keyword, $options: 'i' } },
                { bio: { $regex: keyword, $options: 'i' } }
            ]
        });

        return { users, total };
    }

}

module.exports = SearchRepository;
