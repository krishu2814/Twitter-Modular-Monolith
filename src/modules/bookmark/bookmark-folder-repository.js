const BookmarkFolder = require('./bookmark-folder-model');
const Tweet = require('../tweet/tweet-model');

class BookmarkFolderRepository {

    // 1) create folder
    async create(data) {
        return await BookmarkFolder.create(data);
    }

    // 2) get folder by id
    async getById(folderId) {
        return await BookmarkFolder.findById(folderId);
    }

    // 3) find folder by owner and name
    async findByOwnerAndName(ownerId, name) {
        return await BookmarkFolder.findOne({ owner: ownerId, name });
    }

    // 4) get all folders by owner
    async getByOwner(ownerId) {
        return await BookmarkFolder.find({ owner: ownerId }).sort({ createdAt: -1 });
    }

    // 5) update folder
    async update(folderId, data) {
        return await BookmarkFolder.findByIdAndUpdate(
            folderId,
            data,
            { returnDocument: 'after' }
        );
    }

    // 6) delete folder
    async delete(folderId) {
        return await BookmarkFolder.findByIdAndDelete(folderId);
    }

    // 7) add tweet to folder ($addToSet prevents duplicates)
    async addTweet(folderId, tweetId) {
        return await BookmarkFolder.findByIdAndUpdate(
            folderId,
            { $addToSet: { tweets: tweetId } },
            { returnDocument: 'after' }
        );
    }

    // 8) remove tweet from folder ($pull)
    async removeTweet(folderId, tweetId) {
        return await BookmarkFolder.findByIdAndUpdate(
            folderId,
            { $pull: { tweets: tweetId } },
            { returnDocument: 'after' }
        );
    }

    // 9) get tweets in folder with pagination
    async getFolderTweets(folderId, page = 1, limit = 10) {
        const folder = await BookmarkFolder.findById(folderId);
        if (!folder) return null;

        const skip = (page - 1) * limit;
        const total = folder.tweets.length;
        const tweetIds = folder.tweets.slice(skip, skip + limit);

        const tweets = await Tweet.find({ _id: { $in: tweetIds } })
            .populate('author', 'userName profileImage bio isVerified badgeType')
            .populate({
                path: 'quoteTweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage isVerified badgeType'
                }
            })
            .lean();

        return {
            folder: {
                _id: folder._id,
                name: folder.name,
                description: folder.description,
                icon: folder.icon,
                color: folder.color,
                totalTweets: total
            },
            tweets,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            }
        };
    }
}

module.exports = BookmarkFolderRepository;
