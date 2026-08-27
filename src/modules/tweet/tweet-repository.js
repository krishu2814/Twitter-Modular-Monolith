const Tweet = require('./tweet-model');

class TweetRepository {

    async createTweet(data) {
        return await Tweet.create(data);
    }

    async getTweetById(id) {
        return await Tweet.findById(id)
            .populate('author', 'userName profileImage isVerified badgeType bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage isVerified badgeType bio'
                }
            });
    }

    async deleteTweet(id) {
        return await Tweet.findByIdAndDelete(id);
    }
    
    async getAllTweets() {
        return await Tweet.find({ isHidden: { $ne: true } })
            .sort({ createdAt: -1 })
            .populate('author', 'userName profileImage isVerified badgeType bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage isVerified badgeType bio'
                }
            });
    }
    
    async updateTweet(id, data) {
        return await Tweet.findByIdAndUpdate(
            id,
            data,
            { returnDocument: 'after' }
        );
    }

    async incrementTweetComments(id, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { commentsCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async decrementTweetComments(id, count = 1, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { commentsCount: -count } },
            { returnDocument: 'after', session }
        );
    }

    async incrementTweetBookmarks(id, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { bookmarksCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    async decrementTweetBookmarks(id, session = null) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { bookmarksCount: -1 } },
            { returnDocument: 'after', session }
        );
    }

    async getTweetsByUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const tweets = await Tweet.find({ author: userId, isHidden: { $ne: true } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'userName profileImage isVerified badgeType bio')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage isVerified badgeType bio'
                }
            });

        const total = await Tweet.countDocuments({ author: userId, isHidden: { $ne: true } });
        return { tweets, total };
    }

    async votePoll(tweetId, optionIndex, userId) {
        return await Tweet.findOneAndUpdate(
            { _id: tweetId },
            {
                $inc: { [`poll.options.${optionIndex}.votes`]: 1 },
                $push: { [`poll.options.${optionIndex}.voters`]: userId }
            },
            { returnDocument: 'after' }
        );
    }

    async incrementViews(id) {
        return await Tweet.findByIdAndUpdate(
            id,
            { $inc: { viewsCount: 1 } },
            { returnDocument: 'after' }
        );
    }

    async createTweetWithSession(data, session = null) {
        if (session) {
            const result = await Tweet.create([data], { session });
            return result[0];
        }
        return await Tweet.create(data);
    }

    async getThreadTweets(rootTweetId) {
        return await Tweet.find({
            $or: [
                { _id: rootTweetId },
                { threadHead: rootTweetId }
            ],
            isHidden: { $ne: true }
        })
        .sort({ threadPosition: 1, createdAt: 1 })
        .populate('author', 'userName profileImage isVerified badgeType bio')
        .populate({
            path: 'quoteTweet',
            populate: {
                path: 'author',
                select: 'userName profileImage isVerified badgeType bio'
            }
        });
    }

    async editTweet(id, { content, media, previousContent, previousMedia }) {
        const updateQuery = {
            $set: {
                content,
                isEdited: true,
                editedAt: new Date()
            },
            $push: {
                editHistory: {
                    content: previousContent,
                    media: previousMedia || [],
                    editedAt: new Date()
                }
            }
        };

        if (media !== undefined) {
            updateQuery.$set.media = media;
        }

        return await Tweet.findByIdAndUpdate(
            id,
            updateQuery,
            { returnDocument: 'after' }
        )
        .populate('author', 'userName profileImage isVerified badgeType bio');
    }
}

module.exports = TweetRepository;
