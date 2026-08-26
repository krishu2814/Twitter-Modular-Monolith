const List = require('./list-model');
const Tweet = require('../tweet/tweet-model');

class ListRepository {

    // 1) create list
    async create(data) {
        return await List.create(data);
    }

    // 2) get list by id with populated owner & members
    async getById(id) {
        return await List.findById(id)
            .populate('owner', 'userName profileImage bio')
            .populate('members', 'userName profileImage bio');
    }

    // 3) get all lists owned by user
    async getByOwner(ownerId) {
        return await List.find({ owner: ownerId })
            .sort({ createdAt: -1 })
            .populate('members', 'userName profileImage');
    }

    // 4) update list
    async update(id, data) {
        return await List.findByIdAndUpdate(
            id,
            data,
            { returnDocument: 'after' }
        );
    }

    // 5) delete list
    async delete(id) {
        return await List.findByIdAndDelete(id);
    }

    // 6) add member to list
    async addMember(listId, memberId) {
        return await List.findByIdAndUpdate(
            listId,
            { $addToSet: { members: memberId } },
            { returnDocument: 'after' }
        );
    }

    // 7) remove member from list
    async removeMember(listId, memberId) {
        return await List.findByIdAndUpdate(
            listId,
            { $pull: { members: memberId } },
            { returnDocument: 'after' }
        );
    }

    // 8) get tweets from list members (paginated)
    async getListTweets(memberIds, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const tweets = await Tweet.find({ author: { $in: memberIds } })
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

        const total = await Tweet.countDocuments({ author: { $in: memberIds } });

        return { tweets, total };
    }
}

module.exports = ListRepository;
