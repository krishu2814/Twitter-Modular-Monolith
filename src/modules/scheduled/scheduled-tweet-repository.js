const ScheduledTweet = require('./scheduled-tweet-model');

class ScheduledTweetRepository {

    // 1) create scheduled tweet
    async create(data) {
        return await ScheduledTweet.create(data);
    }

    // 2) get by id
    async getById(id) {
        return await ScheduledTweet.findById(id).populate('author', 'userName profileImage');
    }

    // 3) get all scheduled tweets by an author
    async getByAuthor(authorId) {
        return await ScheduledTweet.find({ author: authorId })
            .sort({ scheduledFor: 1 });
    }

    // 4) find all due tweets that need to be published
    async findDueTweets(currentTime = new Date()) {
        return await ScheduledTweet.find({
            status: 'SCHEDULED',
            scheduledFor: { $lte: currentTime }
        });
    }

    // 5) mark scheduled tweet as published
    async markAsPublished(id, publishedTweetId) {
        return await ScheduledTweet.findByIdAndUpdate(
            id,
            {
                status: 'PUBLISHED',
                publishedTweetId: publishedTweetId
            },
            { returnDocument: 'after' }
        );
    }

    // 6) cancel a scheduled tweet
    async cancel(id) {
        return await ScheduledTweet.findByIdAndUpdate(
            id,
            { status: 'CANCELLED' },
            { returnDocument: 'after' }
        );
    }

    // 7) delete scheduled tweet
    async delete(id) {
        return await ScheduledTweet.findByIdAndDelete(id);
    }
}

module.exports = ScheduledTweetRepository;
