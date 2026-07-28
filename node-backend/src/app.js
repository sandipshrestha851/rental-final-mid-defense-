const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { morganMiddleware } = require('./utils/logger');
const { csrfProtection } = require('./middleware/csrf');
const { sanitizeInput } = require('./middleware/sanitize');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
});
if (!isDev) app.use(limiter);

app.use(morganMiddleware);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use(sanitizeInput);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chat backend (Node.js) is running' });
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', propertyRoutes);
app.use('/api', csrfProtection);
app.use('/api', bookingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', reviewRoutes);
app.use('/api', profileRoutes);
app.use('/api', adminDashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
