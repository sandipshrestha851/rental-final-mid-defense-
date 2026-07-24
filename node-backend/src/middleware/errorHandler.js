const { logger } = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  logger.error(err.stack || err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  const status = err.status || 500;
  const message = status === 500
    ? 'Internal server error'
    : err.message;

  res.status(status).json({ message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

module.exports = { errorHandler, notFoundHandler };
