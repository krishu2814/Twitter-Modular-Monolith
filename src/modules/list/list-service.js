const ListRepository = require('./list-repository');
const UserRepository = require('../user/user-repository');

class ListService {
    constructor() {
        this.listRepository = new ListRepository();
        this.userRepository = new UserRepository();
    }

    // 1) create list
    async createList(ownerId, data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('List name is required');
        }

        const listData = {
            name: data.name.trim(),
            description: data.description ? data.description.trim() : '',
            owner: ownerId,
            isPrivate: data.isPrivate === true,
            members: Array.isArray(data.members) ? data.members : []
        };

        return await this.listRepository.create(listData);
    }

    // 2) get list by id
    async getListById(listId, requesterId) {
        const list = await this.listRepository.getById(listId);
        if (!list) {
            throw new Error('List not found');
        }

        // Privacy check
        if (list.isPrivate && list.owner._id.toString() !== requesterId.toString()) {
            throw new Error('This list is private and you do not have permission to view it');
        }

        return list;
    }

    // 3) get all lists owned by user
    async getUserLists(ownerId) {
        return await this.listRepository.getByOwner(ownerId);
    }

    // 4) update list
    async updateList(listId, ownerId, data) {
        const list = await this.listRepository.getById(listId);
        if (!list) {
            throw new Error('List not found');
        }

        if (list.owner._id.toString() !== ownerId.toString()) {
            throw new Error('Unauthorized: only the list owner can update this list');
        }

        const updateData = {};
        if (data.name) updateData.name = data.name.trim();
        if (data.description !== undefined) updateData.description = data.description.trim();
        if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate === true;

        return await this.listRepository.update(listId, updateData);
    }

    // 5) delete list
    async deleteList(listId, ownerId) {
        const list = await this.listRepository.getById(listId);
        if (!list) {
            throw new Error('List not found');
        }

        if (list.owner._id.toString() !== ownerId.toString()) {
            throw new Error('Unauthorized: only the list owner can delete this list');
        }

        return await this.listRepository.delete(listId);
    }

    // 6) add member to list
    async addMember(listId, ownerId, memberId) {
        const list = await this.listRepository.getById(listId);
        if (!list) {
            throw new Error('List not found');
        }

        if (list.owner._id.toString() !== ownerId.toString()) {
            throw new Error('Unauthorized: only the list owner can add members');
        }

        const memberUser = await this.userRepository.getUserById(memberId);
        if (!memberUser) {
            throw new Error('Member user not found');
        }

        return await this.listRepository.addMember(listId, memberId);
    }

    // 7) remove member from list
    async removeMember(listId, ownerId, memberId) {
        const list = await this.listRepository.getById(listId);
        if (!list) {
            throw new Error('List not found');
        }

        if (list.owner._id.toString() !== ownerId.toString()) {
            throw new Error('Unauthorized: only the list owner can remove members');
        }

        return await this.listRepository.removeMember(listId, memberId);
    }

    // 8) get tweets from list members
    async getListTweets(listId, requesterId, page = 1, limit = 20) {
        const list = await this.listRepository.getById(listId);
        if (!list) {
            throw new Error('List not found');
        }

        if (list.isPrivate && list.owner._id.toString() !== requesterId.toString()) {
            throw new Error('This list is private and you do not have permission to view its tweets');
        }

        const memberIds = list.members.map(m => m._id);
        if (memberIds.length === 0) {
            return { tweets: [], total: 0, page, limit, totalPages: 0 };
        }

        const result = await this.listRepository.getListTweets(memberIds, page, limit);

        return {
            tweets: result.tweets,
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit)
        };
    }
}

module.exports = ListService;
