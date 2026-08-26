const Retweet = require('./retweet-model');
const Tweet = require('../tweet/tweet-model');

class RetweetRepository {

    // 1) create a retweet
    async create(data, session = null) {
        if (session) {
            const result = await Retweet.create([data], { session });
            return result[0];
        }
        return await Retweet.create(data);
    }

    // 2) find retweet by user and tweet
    async findUserAndTweet(userId, tweetId, session = null) {
        const query = Retweet.findOne({
            user: userId,
            tweet: tweetId
        });
        if (session) {
            query.session(session);
        }
        return await query;
    }

    // 3) delete retweet (unretweet)
    async delete(id, session = null) {
        return await Retweet.findByIdAndDelete(id, { session });
    }

    // 4) get all users who retweeted a specific tweet
    async getRetweetsByTweet(tweetId) {
        return await Retweet.find({ tweet: tweetId })
            .populate('user', 'userName profileImage bio');
    }

    // 5) get all tweets retweeted by a user (Profile -> Retweets)
    async getRetweetsByUser(userId) {
        return await Retweet.find({ user: userId })
            .populate({
                path: 'tweet',
                populate: {
                    path: 'author',
                    select: 'userName profileImage bio'
                }
            })
            .sort({ createdAt: -1 });
    }

    // 6) increment tweet retweets count
    async incrementTweetRetweets(tweetId, session = null) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { retweetsCount: 1 } },
            { returnDocument: 'after', session }
        );
    }

    // 7) decrement tweet retweets count
    async decrementTweetRetweets(tweetId, session = null) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { retweetsCount: -1 } },
            { returnDocument: 'after', session }
        );
    }

}

module.exports = RetweetRepository;
