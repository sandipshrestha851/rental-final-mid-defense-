const messageService = require('../services/messageService');

const messageController = {
  async getMessages(req, res) {
    const otherUserId = parseInt(req.params.otherUserId, 10);
    if (Number.isNaN(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    try {
      const messages = await messageService.getConversation(req.userId, otherUserId);
      return res.status(200).json(messages);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = messageController;
