const { verifyAccessToken, verifyRefreshToken, signAccessToken } = require('../utils/jwt');
const { pool } = require('../config/database');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

const PROTECTED_FIELDS = ['ownerId', 'approvalStatus', 'verified', 'bookingCount', 'createdBy', 'adminNotes'];

function tokenRequired(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  const accessToken = token || (req.cookies && req.cookies['access_token']);
  const refreshToken = req.cookies && req.cookies['refresh_token'];

  async function tryAuth() {
    if (accessToken) {
      try {
        const decoded = verifyAccessToken(accessToken);
        req.userId = decoded.user_id;
        req.email = decoded.email;
        req.role = decoded.role || null;
        return next();
      } catch (err) {
        if (err.name !== 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token is invalid' });
        }
      }
    }

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        let table = 'refresh_tokens';
        let idColumn = 'user_id';
        if (decoded.role === 'admin') {
          table = 'admin_refresh_tokens';
          idColumn = 'admin_id';
        }

        const [rows] = await pool.query(
          `SELECT * FROM ${table} WHERE ${idColumn} = ? AND token_hash = ? AND expires_at > NOW()`,
          [decoded.user_id, tokenHash]
        );

        if (rows.length === 0) {
          return res.status(401).json({ message: 'Session expired. Please sign in again.' });
        }

        const newAccessToken = signAccessToken(decoded);
        res.cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          maxAge: 15 * 60 * 1000,
          path: '/',
        });

        req.userId = decoded.user_id;
        req.email = decoded.email;
        req.role = decoded.role || null;
        return next();
      } catch (err) {
        return res.status(401).json({ message: 'Session expired. Please sign in again.' });
      }
    }

    return res.status(401).json({ message: 'Authentication required' });
  }

  tryAuth().catch((err) => {
    logger.error('Auth middleware error:', err.stack || err.message);
    return res.status(500).json({ success: false, message: err.message || 'Authentication error', stack: err.stack });
  });
}

function adminOnly(req, res, next) {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

function stripProtectedFields(body) {
  const sanitized = { ...body };
  for (const field of PROTECTED_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

module.exports = { tokenRequired, adminOnly, stripProtectedFields };
