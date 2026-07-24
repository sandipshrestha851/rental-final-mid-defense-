require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initDb } = require('./config/database');
const { setupSocket } = require('./config/socket');
const { logger } = require('./utils/logger');

const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

const PORT = parseInt(process.env.PORT || '8000', 10);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

(async () => {
  try {
    await initDb();
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`Starting server on port ${PORT}...`);
      logger.info(`REST + Socket.IO ready at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    logger.error('Make sure MySQL (XAMPP) is running and the credentials in .env are correct.');
    process.exit(1);
  }
})();
