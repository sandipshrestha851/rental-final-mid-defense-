const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userModel = require('../models/userModel');
const { signAccessToken, signRefreshToken, signAdminAccessToken, signAdminRefreshToken } = require('../utils/jwt');
const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

function orNull(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

async function storeRefreshToken(table, idColumn, userId, token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.query(
    `INSERT INTO ${table} (${idColumn}, token_hash, expires_at) VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );
}

async function clearRefreshTokens(table, idColumn, userId) {
  await pool.query(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [userId]);
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: '/',
};

const authService = {
  async register(data) {
    const full_name = orNull(data.full_name);
    const email = data.email ? String(data.email).trim().toLowerCase() : '';
    const password = data.password ? String(data.password) : '';
    const phone = orNull(data.phone);
    const gender = orNull(data.gender);
    const date_of_birth = orNull(data.date_of_birth);
    const bio = orNull(data.bio);
    const role = orNull(data.role);

    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      throw err;
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, 12);
    await userModel.create({
      full_name, email, phone, gender, date_of_birth, bio, role, password_hash,
    });

    try {
      const newUser = await userModel.findByEmail(email);
      if (newUser) {
        const NotificationService = require('./notificationService');
        await NotificationService.notify({
          recipientRole: 'admin',
          senderUserId: newUser.id,
          type: 'user_registered',
          title: 'New User Registered',
          message: `A new ${role || 'tenant'} "${full_name}" has registered with email: ${email}`,
          referenceType: 'user',
          referenceId: newUser.id
        });
      }
    } catch (notifyErr) {
      logger.error('Failed to trigger registration notification:', notifyErr.message);
    }

    return { message: 'User registered successfully' };
  },

  async login(email, password) {
    if (!email || !password) {
      const err = new Error('Missing email or password');
      err.status = 400;
      throw err;
    }

    const user = await userModel.findByEmail(email.toLowerCase().trim());

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await clearRefreshTokens('refresh_tokens', 'user_id', user.id);
    await storeRefreshToken('refresh_tokens', 'user_id', user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async adminLogin(username, password) {
    if (!username || !password) {
      const err = new Error('Missing username or password');
      err.status = 400;
      throw err;
    }

    const admin = await userModel.findAdminByUsername(username.trim());

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const accessToken = signAdminAccessToken(admin);
    const refreshToken = signAdminRefreshToken(admin);

    await clearRefreshTokens('admin_refresh_tokens', 'admin_id', admin.id);
    await storeRefreshToken('admin_refresh_tokens', 'admin_id', admin.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: admin.id,
        full_name: 'System Admin',
        email: `${admin.username}@admin.local`,
        role: 'admin',
      },
    };
  },

  async refresh(refreshToken) {
    const { verifyRefreshToken } = require('../utils/jwt');
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
      const err = new Error('Invalid or expired refresh token');
      err.status = 401;
      throw err;
    }

    const newAccessToken = signAccessToken(decoded);
    return { accessToken: newAccessToken };
  },

  async logout(userId, role, refreshToken) {
    try {
      if (role === 'admin') {
        if (refreshToken) {
          const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
          await pool.query(
            'DELETE FROM admin_refresh_tokens WHERE admin_id = ? AND token_hash = ?',
            [userId, tokenHash]
          );
        }
        await clearRefreshTokens('admin_refresh_tokens', 'admin_id', userId);
      } else {
        if (refreshToken) {
          const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
          await pool.query(
            'DELETE FROM refresh_tokens WHERE user_id = ? AND token_hash = ?',
            [userId, tokenHash]
          );
        }
        await clearRefreshTokens('refresh_tokens', 'user_id', userId);
      }
    } catch (err) {
      logger.error('Logout error:', err.message);
    }
  },

  setAuthCookies(res, accessToken, refreshToken, user) {
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const { setCsrfCookie } = require('../middleware/csrf');
    setCsrfCookie(null, res);
  },

  clearAuthCookies(res) {
    res.clearCookie('access_token', { ...cookieOptions });
    res.clearCookie('refresh_token', { ...cookieOptions });
    res.clearCookie('csrf_token', { httpOnly: false, sameSite: 'strict', path: '/' });
  },
};

module.exports = authService;
