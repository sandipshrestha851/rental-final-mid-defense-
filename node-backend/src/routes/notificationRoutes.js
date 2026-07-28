const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = Router();

router.get('/notifications', tokenRequired, notificationController.getNotifications);
router.get('/notifications/unread-count', tokenRequired, notificationController.getUnreadCount);
router.put('/notifications/:id/read', tokenRequired, notificationController.markAsRead);
router.put('/notifications/read-all', tokenRequired, notificationController.markAllAsRead);

module.exports = router;
