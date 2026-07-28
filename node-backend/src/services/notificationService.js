const { pool } = require('../config/database');
const { sendRealtimeNotification, isOnline } = require('../config/socket');
const { logger } = require('../utils/logger');

const NotificationService = {
  /**
   * Reusable notification method.
   * Saves notification to database, emits socket event, and prevents duplicates.
   */
  async notify({
    recipientUserId = null,
    recipientRole = null, // 'admin', 'landlord', 'tenant'
    senderUserId = null,
    type = 'info',
    title,
    message,
    referenceType = null,
    referenceId = null,
  }) {
    try {
      // 1. Resolve role if not provided but recipientUserId is
      let resolvedRole = recipientRole;
      if (!resolvedRole && recipientUserId) {
        const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [recipientUserId]);
        if (rows.length > 0) {
          resolvedRole = rows[0].role;
        }
      }
      if (!resolvedRole) {
        resolvedRole = recipientUserId ? 'tenant' : 'admin';
      }

      // 2. Prevent duplicate notifications for the same event in the last 10 seconds
      let dupQuery = '';
      let dupParams = [];
      if (recipientUserId) {
        dupQuery = `
          SELECT id FROM notifications 
          WHERE recipient_user_id = ? 
            AND type = ? 
            AND reference_type = ? 
            AND reference_id = ?
            AND created_at >= DATE_SUB(NOW(), INTERVAL 10 SECOND)
          LIMIT 1
        `;
        dupParams = [recipientUserId, type, referenceType || null, referenceId ? String(referenceId) : null];
      } else {
        dupQuery = `
          SELECT id FROM notifications 
          WHERE recipient_user_id IS NULL 
            AND type = ? 
            AND reference_type = ? 
            AND reference_id = ?
            AND created_at >= DATE_SUB(NOW(), INTERVAL 10 SECOND)
          LIMIT 1
        `;
        dupParams = [type, referenceType || null, referenceId ? String(referenceId) : null];
      }

      const [existing] = await pool.query(dupQuery, dupParams);
      if (existing.length > 0) {
        logger.info(`Duplicate notification prevented for recipient ${recipientUserId || 'admin'} of type ${type}`);
        // Fetch and return the existing notification
        const [existingRows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [existing[0].id]);
        return existingRows[0];
      }

      // 3. Save notification to database
      const [result] = await pool.query(
        `INSERT INTO notifications 
          (recipient_user_id, sender_user_id, type, title, message, reference_type, reference_id, is_read) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          recipientUserId || null,
          senderUserId || null,
          type,
          title,
          message,
          referenceType || null,
          referenceId ? String(referenceId) : null,
        ]
      );

      const notificationId = result.insertId;

      // Fetch the created notification
      const [rows] = await pool.query('SELECT * FROM notifications WHERE id = ?', [notificationId]);
      const createdNotification = rows[0];

      // 4. Emit Socket.IO event
      try {
        sendRealtimeNotification(recipientUserId, resolvedRole, createdNotification);
      } catch (socketErr) {
        logger.error('Failed to emit socket notification:', socketErr.message);
      }

      return createdNotification;
    } catch (err) {
      logger.error('Error in NotificationService.notify:', err.stack || err.message);
      throw err;
    }
  }
};

module.exports = NotificationService;
