const ReportService = require('./report-service');

class ReportController {
    constructor() {
        this.reportService = new ReportService();
    }

    // POST /api/v1/reports/tweets/:tweetId
    async reportTweet(req, res) {
        try {
            const reporterId = req.user._id;
            const tweetId = req.params.tweetId;
            const result = await this.reportService.reportTweet(reporterId, tweetId, req.body);

            return res.status(201).json({
                status: "success",
                message: "Tweet reported successfully. Our moderation team will review it.",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to submit tweet report",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/reports
    async getReports(req, res) {
        try {
            const result = await this.reportService.getReports(req.query);

            return res.status(200).json({
                status: "success",
                message: "Moderation reports fetched successfully",
                data: result,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch reports",
                data: {},
                err: error.message
            });
        }
    }

    // GET /api/v1/reports/:id
    async getReportById(req, res) {
        try {
            const report = await this.reportService.getReportById(req.params.id);

            return res.status(200).json({
                status: "success",
                message: "Report details fetched successfully",
                data: report,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to fetch report details",
                data: {},
                err: error.message
            });
        }
    }

    // PATCH /api/v1/reports/:id/action
    async actionReport(req, res) {
        try {
            const adminId = req.user._id;
            const reportId = req.params.id;
            const updatedReport = await this.reportService.actionReport(adminId, reportId, req.body);

            return res.status(200).json({
                status: "success",
                message: "Moderation action applied and report updated successfully",
                data: updatedReport,
                err: {}
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message || "Failed to action report",
                data: {},
                err: error.message
            });
        }
    }
}

module.exports = ReportController;
