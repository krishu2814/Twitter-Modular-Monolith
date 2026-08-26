const mongoose = require('mongoose');
const BookmarkRepository = require('./bookmark-repository');
const BookmarkFolderRepository = require('./bookmark-folder-repository');
const Tweet = require('../tweet/tweet-model');

class BookmarkService {
    constructor() {
        this.bookmarkRepository = new BookmarkRepository();
        this.bookmarkFolderRepository = new BookmarkFolderRepository();
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

    // ==========================================
    // 📁 BOOKMARK FOLDERS / COLLECTIONS METHODS
    // ==========================================

    // 1) Create folder
    async createFolder(userId, data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('Folder name is required');
        }

        const existing = await this.bookmarkFolderRepository.findByOwnerAndName(userId, data.name.trim());
        if (existing) {
            throw new Error('A bookmark folder with this name already exists');
        }

        return await this.bookmarkFolderRepository.create({
            name: data.name.trim(),
            description: data.description || '',
            icon: data.icon || '📁',
            color: data.color || '#1DA1F2',
            owner: userId,
            tweets: []
        });
    }

    // 2) Get all folders owned by user
    async getMyFolders(userId) {
        return await this.bookmarkFolderRepository.getByOwner(userId);
    }

    // 3) Get folder by id
    async getFolderById(userId, folderId) {
        const folder = await this.bookmarkFolderRepository.getById(folderId);
        if (!folder) {
            throw new Error('Bookmark folder not found');
        }
        if (folder.owner.toString() !== userId.toString()) {
            throw new Error('Unauthorized: You can only access your own bookmark folders');
        }
        return folder;
    }

    // 4) Update folder
    async updateFolder(userId, folderId, data) {
        const folder = await this.getFolderById(userId, folderId);
        
        const updateData = {};
        if (data.name) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description;
        if (data.icon) updateData.icon = data.icon;
        if (data.color) updateData.color = data.color;

        return await this.bookmarkFolderRepository.update(folder._id, updateData);
    }

    // 5) Delete folder
    async deleteFolder(userId, folderId) {
        const folder = await this.getFolderById(userId, folderId);
        return await this.bookmarkFolderRepository.delete(folder._id);
    }

    // 6) Add tweet to folder
    async addTweetToFolder(userId, folderId, tweetId) {
        // 1) verify tweet exists
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        // 2) verify folder ownership
        const folder = await this.getFolderById(userId, folderId);

        // 3) auto-bookmark globally if not already bookmarked
        const isBookmarked = await this.bookmarkRepository.findUserAndTweet(userId, tweetId);
        if (!isBookmarked) {
            await this.bookmarkRepository.create({ user: userId, tweet: tweetId });
            await this.bookmarkRepository.incrementTweetBookmarks(tweetId);
        }

        // 4) add to folder
        return await this.bookmarkFolderRepository.addTweet(folder._id, tweetId);
    }

    // 7) Remove tweet from folder
    async removeTweetFromFolder(userId, folderId, tweetId) {
        // verify folder ownership
        const folder = await this.getFolderById(userId, folderId);
        return await this.bookmarkFolderRepository.removeTweet(folder._id, tweetId);
    }

    // 8) Get tweets inside folder (paginated)
    async getFolderTweets(userId, folderId, page = 1, limit = 10) {
        // verify folder ownership
        await this.getFolderById(userId, folderId);
        return await this.bookmarkFolderRepository.getFolderTweets(folderId, page, limit);
    }
}

module.exports = BookmarkService;
