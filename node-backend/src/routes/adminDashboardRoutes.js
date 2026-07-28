const { Router } = require('express');
const { tokenRequired, adminOnly } = require('../middleware/authMiddleware');
const controller = require('../controllers/adminDashboardController');
const router = Router();
router.get('/admin/dashboard', tokenRequired, adminOnly, controller.getSummary);
router.get('/admin/dashboard/charts', tokenRequired, adminOnly, controller.getCharts);
module.exports = router;
