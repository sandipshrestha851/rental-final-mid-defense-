const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { morganMiddleware } = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
app.use(limiter);

app.use(morganMiddleware);

app.use(express.json({ limit: '10kb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chat backend (Node.js) is running' });
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
