const { pool } = require('../config/database');

const notificationModel = {
  async findByRecipient(userId, role, limit = 10, offset = 0) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = `
        SELECT * FROM notifications 
        WHERE recipient_user_id IS NULL 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      params = [limit, offset];
    } else {
      query = `
        SELECT * FROM notifications 
        WHERE recipient_user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      params = [userId, limit, offset];
    }

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async countByRecipient(userId, role) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id IS NULL';
    } else {
      query = 'SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id = ?';
      params = [userId];
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count;
  },

  async getUnreadCount(userId, role) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id IS NULL AND is_read = 0';
    } else {
      query = 'SELECT COUNT(*) AS count FROM notifications WHERE recipient_user_id = ? AND is_read = 0';
      params = [userId];
    }

    const [rows] = await pool.query(query, params);
    return rows[0].count;
  },

  async markAsRead(id, userId, role) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_user_id IS NULL';
      params = [id];
    } else {
      query = 'UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_user_id = ?';
      params = [id, userId];
    }

    const [result] = await pool.query(query, params);
    return result.affectedRows > 0;
  },

  async markAllAsRead(userId, role) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'UPDATE notifications SET is_read = 1 WHERE recipient_user_id IS NULL AND is_read = 0';
    } else {
      query = 'UPDATE notifications SET is_read = 1 WHERE recipient_user_id = ? AND is_read = 0';
      params = [userId];
    }

    await pool.query(query, params);
  },

  async deleteById(id, userId, role) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'DELETE FROM notifications WHERE id = ? AND recipient_user_id IS NULL';
      params = [id];
    } else {
      query = 'DELETE FROM notifications WHERE id = ? AND recipient_user_id = ?';
      params = [id, userId];
    }

    const [result] = await pool.query(query, params);
    return result.affectedRows > 0;
  },

  async deleteRead(userId, role) {
    let query = '';
    let params = [];

    if (role === 'admin') {
      query = 'DELETE FROM notifications WHERE recipient_user_id IS NULL AND is_read = 1';
    } else {
      query = 'DELETE FROM notifications WHERE recipient_user_id = ? AND is_read = 1';
      params = [userId];
    }

    await pool.query(query, params);
  },
};

module.exports = notificationModel;
