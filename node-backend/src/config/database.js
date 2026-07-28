const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chat_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDb() {
  logger.info('Initializing database schema...');

  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'chat_app'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await rootConn.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      phone VARCHAR(30) DEFAULT NULL,
      gender VARCHAR(30) DEFAULT NULL,
      date_of_birth DATE DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      role VARCHAR(30) DEFAULT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id VARCHAR(36) PRIMARY KEY,
      landlord_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      location VARCHAR(255) NOT NULL,
      category VARCHAR(50) DEFAULT NULL,
      address VARCHAR(255) DEFAULT NULL,
      city VARCHAR(100) DEFAULT NULL,
      state VARCHAR(100) DEFAULT NULL,
      zip_code VARCHAR(20) DEFAULT NULL,
      country VARCHAR(100) DEFAULT NULL,
      image_url VARCHAR(500) NOT NULL DEFAULT '',
      status ENUM('Active', 'Pending', 'Draft', 'Rejected') NOT NULL DEFAULT 'Pending',
      beds INT NOT NULL DEFAULT 1,
      baths INT NOT NULL DEFAULT 1,
      guests INT DEFAULT 1,
      sqft INT DEFAULT 0,
      rating DECIMAL(2,1) DEFAULT 0.0,
      price DECIMAL(10,2) NOT NULL,
      bookings INT DEFAULT 0,
      amenities JSON DEFAULT NULL,
      photos JSON DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id VARCHAR(36) NOT NULL,
      guest_id INT NOT NULL,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      guests INT NOT NULL,
      total_price DECIMAL(10, 2) NOT NULL,
      status ENUM('pending','confirmed','completed','cancelled','rejected','cancelled_by_tenant','cancelled_by_landlord','expired') NOT NULL DEFAULT 'pending',
      cancellation_reason TEXT DEFAULT NULL,
      cancelled_at DATETIME DEFAULT NULL,
      cancelled_by VARCHAR(30) DEFAULT NULL,
      special_requests TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_bookings_status (status),
      INDEX idx_bookings_dates (check_in, check_out),
      INDEX idx_bookings_property (property_id),
      INDEX idx_bookings_guest (guest_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_status_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NOT NULL,
      status VARCHAR(30) NOT NULL,
      changed_by INT DEFAULT NULL,
      note TEXT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
      INDEX idx_history_booking (booking_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      related_id INT DEFAULT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_notifications_user (user_id),
      INDEX idx_notifications_read (is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN landlord_id INT NOT NULL AFTER id`);
  } catch {} // column already exists
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN description TEXT DEFAULT NULL AFTER title`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN category VARCHAR(50) DEFAULT NULL AFTER location`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN property_type VARCHAR(50) DEFAULT NULL AFTER category`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN address VARCHAR(255) DEFAULT NULL AFTER category`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN city VARCHAR(100) DEFAULT NULL AFTER address`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN state VARCHAR(100) DEFAULT NULL AFTER city`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN zip_code VARCHAR(20) DEFAULT NULL AFTER state`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN country VARCHAR(100) DEFAULT NULL AFTER zip_code`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN guests INT DEFAULT 1 AFTER baths`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN sqft INT DEFAULT 0 AFTER guests`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN amenities JSON DEFAULT NULL AFTER bookings`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN photos JSON DEFAULT NULL AFTER amenities`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER photos`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties ADD FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE CASCADE`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD COLUMN status ENUM('pending','confirmed','completed','cancelled','rejected','cancelled_by_tenant','cancelled_by_landlord','expired') NOT NULL DEFAULT 'pending' AFTER total_price`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD COLUMN cancellation_reason TEXT DEFAULT NULL AFTER status`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD COLUMN cancelled_at DATETIME DEFAULT NULL AFTER cancellation_reason`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD COLUMN cancelled_by VARCHAR(30) DEFAULT NULL AFTER cancelled_at`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD COLUMN special_requests TEXT DEFAULT NULL AFTER cancelled_by`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD INDEX idx_bookings_status (status)`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD INDEX idx_bookings_dates (check_in, check_out)`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD INDEX idx_bookings_property (property_id)`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE bookings ADD INDEX idx_bookings_guest (guest_id)`);
  } catch {}

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admin_refresh_tokens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id VARCHAR(36) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      INDEX idx_images_property (property_id),
      INDEX idx_images_order (property_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      property_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_wishlist (user_id, property_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      INDEX idx_wishlist_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id VARCHAR(36) NOT NULL,
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      INDEX idx_views_property (property_id),
      INDEX idx_views_date (viewed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      property_id VARCHAR(36) NOT NULL,
      user_id INT NOT NULL,
      rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_reviews_property (property_id),
      INDEX idx_reviews_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS review_replies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      review_id INT NOT NULL,
      user_id INT NOT NULL,
      reply TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_replies_review (review_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recently_viewed (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      property_id VARCHAR(36) NOT NULL,
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
      INDEX idx_recent_user (user_id),
      INDEX idx_recent_time (user_id, viewed_at DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  try {
    await pool.query(`CREATE INDEX idx_properties_status ON properties (status)`);
  } catch {}
  try {
    await pool.query(`CREATE INDEX idx_properties_price ON properties (price)`);
  } catch {}
  try {
    await pool.query(`CREATE INDEX idx_properties_city ON properties (city)`);
  } catch {}
  try {
    await pool.query(`CREATE INDEX idx_properties_category ON properties (category)`);
  } catch {}
  try {
    await pool.query(`CREATE INDEX idx_properties_landlord ON properties (landlord_id)`);
  } catch {}
  try {
    await pool.query(`CREATE INDEX idx_properties_title ON properties (title(255))`);
  } catch {}

  try {
    await pool.query(`ALTER TABLE properties ADD COLUMN review_count INT NOT NULL DEFAULT 0 AFTER bookings`);
  } catch {}
  try {
    await pool.query(`ALTER TABLE properties MODIFY COLUMN rating DECIMAL(3,2) DEFAULT 0.0`);
  } catch {}
  const [[{ hasReviews }]] = await pool.query(`SELECT COUNT(*) > 0 AS hasReviews FROM reviews`);
  if (hasReviews) {
    await pool.query(`
      UPDATE properties p
      SET p.rating = COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.property_id = p.id), 0),
          p.review_count = (SELECT COUNT(*) FROM reviews r WHERE r.property_id = p.id)
      WHERE p.review_count = 0
      AND (SELECT COUNT(*) FROM reviews r WHERE r.property_id = p.id) > 0
    `);
  }

  const [admins] = await pool.query('SELECT id FROM admin LIMIT 1');
  const strongPassword = process.env.ADMIN_PASSWORD || `Admin_${crypto.randomUUID().split('-')[0]}_${Date.now().toString(36)}`;
  const defaultPasswordHash = await bcrypt.hash(strongPassword, 12);
  if (admins.length === 0) {
    await pool.query(
      'INSERT INTO admin (username, password) VALUES (?, ?)',
      ['admin', defaultPasswordHash]
    );
    logger.info(`Admin account created. Username: admin, Password: ${strongPassword}`);
    logger.info(`Change password via .env ADMIN_PASSWORD or update in database.`);
  } else {
    await pool.query(
      'UPDATE admin SET password = ? WHERE username = ?',
      [defaultPasswordHash, 'admin']
    );
    logger.info(`Admin password reset. New credentials - Username: admin, Password: ${strongPassword}`);
  }

  logger.info('Database schema initialized successfully.');
}

module.exports = { pool, initDb };
