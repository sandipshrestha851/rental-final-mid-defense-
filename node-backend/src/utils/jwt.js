const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function signToken(user) {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function signAdminToken(admin) {
  return jwt.sign(
    {
      user_id: admin.id,
      email: `${admin.username}@admin.local`,
      full_name: 'System Admin',
      role: 'admin',
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, signAdminToken, verifyToken, JWT_SECRET };
