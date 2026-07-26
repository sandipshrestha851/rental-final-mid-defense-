const { verifyToken } = require('../utils/jwt');

function tokenRequired(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  let token = null;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.user_id;
    req.email = decoded.email;
    req.role = decoded.role || null;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    return res.status(401).json({ message: 'Token is invalid' });
  }
}

module.exports = { tokenRequired };
