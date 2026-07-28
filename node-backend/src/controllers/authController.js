const authService = require('../services/authService');
const { verifyRefreshToken, signAccessToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');

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
      authService.setAuthCookies(res, result.accessToken, result.refreshToken, result.user);
      return res.status(200).json({
        user: result.user,
        token: result.accessToken,
      });
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
      authService.setAuthCookies(res, result.accessToken, result.refreshToken, result.user);
      return res.status(200).json({
        user: result.user,
        token: result.accessToken,
      });
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({
        message: status === 500 ? 'Internal server error' : err.message,
      });
    }
  },

  async refresh(req, res) {
    try {
      const refreshToken = req.cookies && req.cookies['refresh_token'];
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
      }
      const result = await authService.refresh(refreshToken);
      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000,
        path: '/',
      });
      return res.status(200).json({ message: 'Token refreshed' });
    } catch (err) {
      const status = err.status || 500;
      authService.clearAuthCookies(res);
      return res.status(status).json({
        message: status === 500 ? 'Internal server error' : err.message,
      });
    }
  },

  async logout(req, res) {
    try {
      const userId = req.userId;
      const role = req.role;
      const refreshToken = req.cookies && req.cookies['refresh_token'];
      await authService.logout(userId, role, refreshToken);
      authService.clearAuthCookies(res);
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      logger.error('Logout error:', err.message);
      authService.clearAuthCookies(res);
      return res.status(200).json({ message: 'Logged out' });
    }
  },

  async me(req, res) {
    try {
      const userModel = require('../models/userModel');
      const user = await userModel.findById(req.userId);
      if (!user) {
        authService.clearAuthCookies(res);
        return res.status(401).json({ message: 'User not found' });
      }
      return res.status(200).json({ user });
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

module.exports = authController;
