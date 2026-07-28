const crypto = require('crypto');
const { logger } = require('../utils/logger');

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

function csrfProtection(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies && req.cookies['csrf_token'];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    logger.warn(`CSRF check failed for ${req.method} ${req.path}: missing token`);
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  if (cookieToken !== headerToken) {
    logger.warn(`CSRF check failed for ${req.method} ${req.path}: token mismatch`);
    return res.status(403).json({ message: 'CSRF token mismatch' });
  }

  next();
}

function setCsrfCookie(req, res) {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

module.exports = { csrfProtection, setCsrfCookie };
