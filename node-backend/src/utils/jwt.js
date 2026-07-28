const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (ACCESS_SECRET + '_refresh');

function signAccessToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      type: 'access',
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function signAdminAccessToken(admin) {
  return jwt.sign(
    {
      user_id: admin.id,
      email: `${admin.username}@admin.local`,
      full_name: 'System Admin',
      role: 'admin',
      type: 'access',
    },
    ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      type: 'refresh',
    },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function signAdminRefreshToken(admin) {
  return jwt.sign(
    {
      user_id: admin.id,
      type: 'refresh',
    },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

function verifyToken(token) {
  try {
    return verifyAccessToken(token);
  } catch {
    return verifyRefreshToken(token);
  }
}

module.exports = {
  signAccessToken, signAdminAccessToken,
  signRefreshToken, signAdminRefreshToken,
  verifyAccessToken, verifyRefreshToken, verifyToken,
  ACCESS_SECRET, REFRESH_SECRET,
};
