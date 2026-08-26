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
            { returnDocument: 'after' }
        );
    }

    async getTweetsByHashtag(title) {
        return await Hashtag.findOne(
            { title }).populate({
                path: 'tweets',
                populate: {
                    path: 'author',
                    select: 'userName profileImage'
                }
            }
        );
    }

    async getTrending(limit = 10) {
        return await Hashtag.aggregate([
            {
                $project: {
                    title: 1,
                    tweetCount: { $size: "$tweets" }
                }
            },
            { $sort: { tweetCount: -1 } },
            { $limit: limit }
        ]);
    }

}

module.exports = HashtagRepository;
