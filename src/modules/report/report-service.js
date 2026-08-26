const ReportRepository = require('./report-repository');
const Tweet = require('../tweet/tweet-model');

class ReportService {
    constructor() {
        this.reportRepository = new ReportRepository();
    }

    // 1) Submit a report for a tweet
    async reportTweet(reporterId, tweetId, data) {
        // 1) check if tweet exists
        const tweet = await Tweet.findById(tweetId);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        // 2) prevent self-reporting
        if (tweet.author.toString() === reporterId.toString()) {
            throw new Error('You cannot report your own tweet');
        }

        // 3) check for duplicate report
        const existing = await this.reportRepository.findByReporterAndTweet(reporterId, tweetId);
        if (existing) {
            throw new Error('You have already reported this tweet');
        }

        // 4) validate reason
        const validReasons = ['SPAM', 'HARASSMENT', 'HATE_SPEECH', 'MISINFORMATION', 'VIOLENCE', 'OTHER'];
        if (!data.reason || !validReasons.includes(data.reason)) {
            throw new Error(`Invalid report reason. Must be one of: ${validReasons.join(', ')}`);
        }

        // 5) create report
        const report = await this.reportRepository.create({
            reporter: reporterId,
            reportedTweet: tweetId,
            reportedUser: tweet.author,
            reason: data.reason,
            description: data.description || '',
            status: 'PENDING'
        });

        // 6) increment reports count and auto-flag if threshold (3) reached
        const updatedTweet = await this.reportRepository.incrementTweetReports(tweetId, 3);

        return {
            report,
            tweetReportsCount: updatedTweet ? updatedTweet.reportsCount : 1,
            isTweetFlagged: updatedTweet ? updatedTweet.isFlagged : false
        };
    }

    // 2) Get all reports with optional filtering & pagination
    async getReports(query = {}) {
        const page = Math.max(1, parseInt(query.page) || 1);
        const limit = Math.min(50, parseInt(query.limit) || 20);

        const filter = {};
        if (query.status) filter.status = query.status;
        if (query.reason) filter.reason = query.reason;

        return await this.reportRepository.findAll(filter, page, limit);
    }

    // 3) Get single report by id
    async getReportById(reportId) {
        const report = await this.reportRepository.findById(reportId);
        if (!report) {
            throw new Error('Report not found');
        }
        return report;
    }

    // 4) Admin action report (resolve/dismiss and take action on tweet)
    async actionReport(adminId, reportId, data) {
        const report = await this.reportRepository.findById(reportId);
        if (!report) {
            throw new Error('Report not found');
        }

        const validActions = ['NONE', 'TWEET_HIDDEN', 'TWEET_DELETED', 'USER_WARNED', 'NO_ACTION'];
        const actionTaken = data.actionTaken || 'NO_ACTION';
        if (!validActions.includes(actionTaken)) {
            throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
        }

        const status = data.status || 'RESOLVED';
        if (!['RESOLVED', 'DISMISSED'].includes(status)) {
            throw new Error('Status must be either RESOLVED or DISMISSED');
        }

        // Apply action to the reported tweet if applicable
        if (report.reportedTweet) {
            const tweetId = report.reportedTweet._id || report.reportedTweet;
            if (actionTaken === 'TWEET_HIDDEN') {
                await this.reportRepository.updateTweetVisibility(tweetId, true);
            } else if (actionTaken === 'TWEET_DELETED') {
                await this.reportRepository.deleteTweet(tweetId);
            }
        }

        // Update report status
        const updatedReport = await this.reportRepository.update(reportId, {
            status,
            actionTaken,
            resolvedBy: adminId,
            resolvedAt: new Date()
        });

        return updatedReport;
    }
}

module.exports = ReportService;
