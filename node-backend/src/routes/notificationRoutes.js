const { Router } = require('express');
const { tokenRequired } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

const router = Router();

router.get('/notifications', tokenRequired, notificationController.getNotifications);
router.get('/notifications/unread-count', tokenRequired, notificationController.getUnreadCount);

// Support both PATCH and PUT for marking notifications as read
router.patch('/notifications/:id/read', tokenRequired, notificationController.markAsRead);
router.put('/notifications/:id/read', tokenRequired, notificationController.markAsRead);

router.patch('/notifications/read-all', tokenRequired, notificationController.markAllAsRead);
router.put('/notifications/read-all', tokenRequired, notificationController.markAllAsRead);

// Support DELETE routes for notifications
router.delete('/notifications/read', tokenRequired, notificationController.deleteReadNotifications);
router.delete('/notifications/:id', tokenRequired, notificationController.deleteNotification);

module.exports = router;
