const SearchRepository = require('./search-repository');

class SearchService {
    constructor() {
        this.searchRepository = new SearchRepository();
    }

    async searchTweets(keyword, page = 1, limit = 10) {
        if (!keyword || keyword.trim() === '') {
            throw new Error('Search keyword cannot be empty');
        }
        return await this.searchRepository.searchTweets(keyword.trim(), page, limit);
    }

    async searchUsers(keyword, page = 1, limit = 10) {
        if (!keyword || keyword.trim() === '') {
            throw new Error('Search keyword cannot be empty');
        }
        return await this.searchRepository.searchUsers(keyword.trim(), page, limit);
    }
}

module.exports = SearchService;
