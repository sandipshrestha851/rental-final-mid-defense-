const { pool } = require('../config/database');

const messageModel = {
  async create(senderId, receiverId, messageText) {
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [senderId, receiverId, messageText]
    );
    return result.insertId;
  },

  async findByConversation(userId1, userId2) {
    const [messages] = await pool.query(
      `SELECT id, sender_id, receiver_id, message, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId1, userId2, userId2, userId1]
    );
    return messages;
  },
};

module.exports = messageModel;
