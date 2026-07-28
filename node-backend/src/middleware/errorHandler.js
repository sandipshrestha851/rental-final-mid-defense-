const { logger } = require('../utils/logger');

function getErrorMessage(err) {
  if (typeof err === 'string') return err;
  if (err && typeof err.message === 'string') return err.message;
  if (err && typeof err.code === 'string') return `Error code: ${err.code}`;
  try {
    const s = String(err);
    if (s && s !== '[object Object]') return s;
  } catch {}
  return 'Unknown error (no message)';
}

function errorHandler(err, req, res, _next) {
  try {
    const msg = getErrorMessage(err);

    logger.error('========== SERVER ERROR ==========');
    logger.error(err && err.stack ? err.stack : msg);
    logger.error(`Route: ${req.method} ${req.originalUrl}`);
    logger.error(`Params: ${JSON.stringify(req.params || {})}`);

    if (err && err.type === 'entity.parse.failed') {
      return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
    }

    let status = err && err.status ? err.status : 500;
    let message = msg;

    if (err && err.name === 'MulterError') {
      const statusMap = {
        LIMIT_FILE_SIZE: 413,
        LIMIT_FILE_COUNT: 400,
        LIMIT_FIELD_KEY: 400,
        LIMIT_FIELD_VALUE: 400,
        LIMIT_FIELD_COUNT: 400,
        LIMIT_UNEXPECTED_FILE: 400,
      };
      status = statusMap[err.code] || 400;
      message = `Upload error: ${msg}`;
    }

    const code = err && err.code;
    if (code === 'ER_DUP_ENTRY') message = `Database duplicate entry: ${msg}`;
    if (code === 'ER_NO_REFERENCED_ROW_2' || code === 'ER_NO_REFERENCED_ROW') message = `Database foreign key error: ${msg}`;
    if (code === 'ER_UPDATABLE_NOT_SUPPORTED') message = `Database self-reference error: ${msg}`;
    if (code === 'ECONNREFUSED') message = 'Database connection refused';
    if (code === 'ENOENT') message = `File not found: ${msg}`;
    if (code === 'EACCES') message = `Permission denied: ${msg}`;

    const stack = err && err.stack ? err.stack : undefined;

    res.status(status).json({ success: false, message, ...(stack ? { stack } : {}) });
  } catch (handlerErr) {
    logger.error('CRASH IN ERROR HANDLER:');
    logger.error(handlerErr && handlerErr.stack ? handlerErr.stack : String(handlerErr));
    try {
      res.status(500).json({ success: false, message: 'Critical server error', internalError: String(handlerErr) });
    } catch {
      res.end('Critical server error');
    }
  }
}

function notFoundHandler(req, res) {
  res.status(404).json({ message: 'Route not found' });
}

module.exports = { errorHandler, notFoundHandler };
