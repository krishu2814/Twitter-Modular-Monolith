const Report = require('./report-model');
const Tweet = require('../tweet/tweet-model');

class ReportRepository {

    // 1) create new report
    async create(data) {
        return await Report.create(data);
    }

    // 2) find report by id
    async findById(reportId) {
        return await Report.findById(reportId)
            .populate('reporter', 'userName email')
            .populate({
                path: 'reportedTweet',
                populate: {
                    path: 'author',
                    select: 'userName email isVerified'
                }
            })
            .populate('reportedUser', 'userName email')
            .populate('resolvedBy', 'userName email');
    }

    // 3) find report by reporter and tweet
    async findByReporterAndTweet(reporterId, tweetId) {
        return await Report.findOne({
            reporter: reporterId,
            reportedTweet: tweetId
        });
    }

    // 4) find all reports with filtering and pagination
    async findAll(filter = {}, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const reports = await Report.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('reporter', 'userName email')
            .populate({
                path: 'reportedTweet',
                populate: {
                    path: 'author',
                    select: 'userName email'
                }
            })
            .populate('reportedUser', 'userName email')
            .lean();

        const total = await Report.countDocuments(filter);

        return {
            reports,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1
        };
    }

    // 5) update report status & action taken
    async update(reportId, updateData) {
        return await Report.findByIdAndUpdate(
            reportId,
            updateData,
            { returnDocument: 'after' }
        );
    }

    // 6) increment tweet reports count and auto-flag if threshold reached
    async incrementTweetReports(tweetId, threshold = 3) {
        // 1) increment reports count
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            { $inc: { reportsCount: 1 } },
            { returnDocument: 'after' }
        );

        if (!tweet) return null;

        // 2) auto-flag if threshold reached (>= 3 reports)
        if (tweet.reportsCount >= threshold && !tweet.isFlagged) {
            tweet.isFlagged = true;
            await tweet.save();
        }

        return tweet;
    }

    // 7) update tweet visibility (soft-hide or restore)
    async updateTweetVisibility(tweetId, isHidden) {
        return await Tweet.findByIdAndUpdate(
            tweetId,
            { isHidden },
            { returnDocument: 'after' }
        );
    }

    // 8) delete tweet (for take-down action)
    async deleteTweet(tweetId) {
        return await Tweet.findByIdAndDelete(tweetId);
    }
}

module.exports = ReportRepository;
