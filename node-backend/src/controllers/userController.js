const userModel = require('../models/userModel');
const { isOnline } = require('../config/socket');

const userController = {
  async getUsers(req, res) {
    try {
      const users = await userModel.findAllExcept(req.userId);
      const result = users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        gender: u.gender,
        bio: u.bio,
        role: u.role,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
        is_online: isOnline(u.id),
      }));
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = userController;
