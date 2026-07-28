const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');

const router = Router();

router.get('/landlord/dashboard', tokenRequired, dashboardController.getSummary);
router.get('/landlord/revenue', tokenRequired, dashboardController.getRevenue);
router.get('/landlord/occupancy', tokenRequired, dashboardController.getOccupancy);
router.get('/landlord/booking-stats', tokenRequired, dashboardController.getBookingStats);
router.get('/landlord/property-analytics', tokenRequired, dashboardController.getPropertyAnalytics);
router.get('/landlord/booking-trends', tokenRequired, dashboardController.getBookingTrends);
router.get('/landlord/income-charts', tokenRequired, dashboardController.getIncomeCharts);

module.exports = router;
