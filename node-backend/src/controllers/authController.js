const authService = require('../services/authService');

const authController = {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      return res.status(201).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        message: status === 500 ? 'Internal server error' : err.message,
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      return res.status(200).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        message: status === 500 ? 'Internal server error' : err.message,
      });
    }
  },

  async adminLogin(req, res) {
    try {
      const { username, password } = req.body;
      const result = await authService.adminLogin(username, password);
      return res.status(200).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        message: status === 500 ? 'Internal server error' : err.message,
      });
    }
  },
};

module.exports = authController;
