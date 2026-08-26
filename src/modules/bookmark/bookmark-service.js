const mongoose = require('mongoose');
const BookmarkRepository = require('./bookmark-repository');
const Tweet = require('../tweet/tweet-model');

class BookmarkService {
    constructor() {
        this.bookmarkRepository = new BookmarkRepository();
    }

    async toggleBookmark(userId, tweetId) {
        // 1) verify tweet exists
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 2) check if already bookmarked
            const alreadyBookmarked = await this.bookmarkRepository.findUserAndTweet(userId, tweetId, session);

            if (alreadyBookmarked) {
                // UN-BOOKMARK
                await this.bookmarkRepository.delete(alreadyBookmarked._id, session);
                await this.bookmarkRepository.decrementTweetBookmarks(tweetId, session);

                await session.commitTransaction();
                session.endSession();

                return { bookmarked: false };
            }

            // BOOKMARK
            await this.bookmarkRepository.create({
                user: userId,
                tweet: tweetId
            }, session);

            await this.bookmarkRepository.incrementTweetBookmarks(tweetId, session);

            await session.commitTransaction();
            session.endSession();

            return { bookmarked: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async getBookmarks(userId, page = 1, limit = 10) {
        const result = await this.bookmarkRepository.getBookmarksByUser(userId, page, limit);

        return {
            bookmarks: result.bookmarks,
            pagination: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit)
            }
        };
    }
}

module.exports = BookmarkService;
