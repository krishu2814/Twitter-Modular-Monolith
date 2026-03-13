const Hashtag = require('./hashtag-model');

class HashtagRepository {
    async findHashtagByTitle(title) {
        return await Hashtag.findOne({ title });
    }

    async createHashtag(data) {
        return await Hashtag.create(data);
    }

    async addTweetToHashtag(title, tweetId) {
        return await Hashtag.findOneAndUpdate(
            { title },
            { $addToSet: { tweets: tweetId } }, // $addToSet is a MongoDB array operator
            { new: true }
        );
    }

    async getTweetsByHashtag(title) {
        return await Hashtag.findOne(
            { title }).populate({
                path: 'tweets',
                populate: {
                    path: 'user',
                    select: 'userName'
                }
            }
        );
    }

}

module.exports = HashtagRepository;
