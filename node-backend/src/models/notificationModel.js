const { pool } = require('../config/database');

const notificationModel = {
  async create(userId, title, message, type, relatedId) {
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, related_id) VALUES (?, ?, ?, ?, ?)',
      [userId, title, message, type || 'info', relatedId || null]
    );
    return result.insertId;
  },

  async findByUserId(userId, limit = 20) {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  },

  async getUnreadCount(userId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0].count;
  },

  async markAsRead(id, userId) {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  },

  async markAllAsRead(userId) {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [userId]
    );
  },
};

module.exports = notificationModel;
