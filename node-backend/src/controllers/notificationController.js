const notificationModel = require('../models/notificationModel');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationModel.findByUserId(req.userId);
    const unreadCount = await notificationModel.getUnreadCount(req.userId);
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await notificationModel.markAsRead(id, req.userId);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    await notificationModel.markAllAsRead(req.userId);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationModel.getUnreadCount(req.userId);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markAsRead, markAllAsRead, getUnreadCount };
