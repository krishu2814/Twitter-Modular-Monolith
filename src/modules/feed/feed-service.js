const FeedRepository = require('./feed-repository');

class FeedService {
    constructor() {
        this.feedRepository = new FeedRepository();
    }

    async getFeed(userId, page, limit) {
        try {
            const feed = await this.feedRepository.getFeedTweetsFromUser(userId, page, limit);
            return feed;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = FeedService;
