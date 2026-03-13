const HashRepository = require('./hashtag-repository');

class HashService {
    constructor() {
        this.hashtagRepository = new HashRepository();
    }

    /**
     * Process hashtags from tweet content
     * Extracts all hashtags from a tweet
     * tags is an array of mutliple tag [.......]
     */
    async processHashtagsFromTweet(tags, tweetId) {
        
        if (!tags || tags.length === 0) return;

        try {
            for (let tag of tags) {
                const title = tag.toLowerCase();
                const existingHashtag = await this.hashtagRepository.findHashtagByTitle(title);
                /**
                 * If already exists -> then do not create duplicate hashatag -> just add tweets
                 * If not exists -> create one and tweets
                 */
                if (existingHashtag) {
                    await this.hashtagRepository.addTweetToHashtag(title, tweetId);
                } else {
                    await this.hashtagRepository.createHashtag({
                        title,
                        tweets: [tweetId]
                    });
                }
            }
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get tweets by hashtag
     */
    async getTweetsByHashtag(title) {

        try {
            const result = await this.hashtagRepository.getTweetsByHashtag(title.toLowerCase());
            if (!result) {
                throw new Error("Hashtag not found");
            }
            return result;
        } catch (error) {
            throw error;
        }
    }

}

module.exports = HashService;
