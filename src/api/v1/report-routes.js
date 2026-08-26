const express = require('express');
const router = express.Router();

const authentication = require('../../middlewares/auth-middleware');
const ReportController = require('../../modules/report/report-controller');
const reportController = new ReportController();

// Report a tweet: POST /api/v1/reports/tweets/:tweetId
router.post('/tweets/:tweetId', authentication, reportController.reportTweet.bind(reportController));

// List all reports (with filter & pagination): GET /api/v1/reports
router.get('/', authentication, reportController.getReports.bind(reportController));

// Get report details: GET /api/v1/reports/:id
router.get('/:id', authentication, reportController.getReportById.bind(reportController));

// Action a report: PATCH /api/v1/reports/:id/action
router.patch('/:id/action', authentication, reportController.actionReport.bind(reportController));

module.exports = router;
