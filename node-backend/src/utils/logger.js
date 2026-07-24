const morgan = require('morgan');

const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message) => console.error(`[ERROR] ${message}`),
  warn: (message) => console.warn(`[WARN] ${message}`),
};

const morganStream = { write: (message) => logger.info(message.trim()) };
const morganMiddleware = morgan('dev', { stream: morganStream });

module.exports = { logger, morganMiddleware };
