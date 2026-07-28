const notificationModel = require('../models/notificationModel');

/** Helper to map database notification object to frontend-friendly type */
function mapToFrontend(notification) {
  return {
    id: notification.id,
    user_id: notification.recipient_user_id,
    sender_user_id: notification.sender_user_id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    reference_type: notification.reference_type,
    reference_id: notification.reference_id,
    related_id: notification.reference_id, // duplicate for frontend compatibility
    is_read: notification.is_read,
    created_at: notification.created_at,
  };
}

async function getNotifications(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const rawNotifications = await notificationModel.findByRecipient(
      req.userId,
      req.role,
      limit,
      offset
    );

    const totalCount = await notificationModel.countByRecipient(req.userId, req.role);
    const unreadCount = await notificationModel.getUnreadCount(req.userId, req.role);

    const notifications = rawNotifications.map(mapToFrontend);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      notifications,
      unreadCount,
      page,
      limit,
      totalPages,
      totalCount,
    });
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationModel.getUnreadCount(req.userId, req.role);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const updated = await notificationModel.markAsRead(id, req.userId, req.role);
    if (!updated) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationModel.markAllAsRead(req.userId, req.role);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

async function deleteNotification(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }

    const deleted = await notificationModel.deleteById(id, req.userId, req.role);
    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function deleteReadNotifications(req, res, next) {
  try {
    await notificationModel.deleteRead(req.userId, req.role);
    res.json({ message: 'Read notifications deleted successfully' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
};
