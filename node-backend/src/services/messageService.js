const messageModel = require('../models/messageModel');

const messageService = {
  async getConversation(userId, otherUserId) {
    const messages = await messageModel.findByConversation(userId, otherUserId);
    return messages.map((m) => ({
      id: m.id,
      sender_id: m.sender_id,
      receiver_id: m.receiver_id,
      message: m.message,
      created_at: m.created_at ? new Date(m.created_at).toISOString() : null,
    }));
  },
};

module.exports = messageService;
