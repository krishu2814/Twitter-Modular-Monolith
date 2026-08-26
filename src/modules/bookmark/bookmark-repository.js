const Bookmark = require('./bookmark-model');
const Tweet = require('../tweet/tweet-model');

class BookmarkRepository {

    // 1) create bookmark
    async create(data, session = null) {
        if (session) {
            const result = await Bookmark.create([data], { session });
            return result[0];
        }
        return await Bookmark.create(data);
    }

    // 2) find user bookmark for a tweet
    async findUserAndTweet(userId, tweetId, session = null) {
        const query = Bookmark.findOne({
            user: userId,
            tweet: tweetId
        });
        if (session) {
            query.session(session);
        }
        return await query;
    }

    // 3) delete bookmark
    async delete(id, session = null) {
        return await Bookmark.findByIdAndDelete(id, { session });
    }

    // 4) get all bookmarked tweets for a user (paginated)
    async getBookmarksByUser(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const bookmarks = await Bookmark.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'tweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage bio'
                }
            })
            .lean();

        const total = await Bookmark.countDocuments({ user: userId });

        return {
            bookmarks,
            total
        };
    }

    // 5) increment bookmarksCount on tweet
    async incrementTweetBookmarks(tweetId, session = null) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { bookmarksCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    // 6) decrement bookmarksCount on tweet
    async decrementTweetBookmarks(tweetId, session = null) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { bookmarksCount: -1 } },
            { returnDocument: 'after', session }
        );
    }

}

module.exports = BookmarkRepository;
