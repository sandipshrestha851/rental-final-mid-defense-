const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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
      title VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      image_url VARCHAR(500) NOT NULL,
      status ENUM('Active', 'Pending', 'Draft', 'Rejected') NOT NULL,
      beds INT NOT NULL,
      baths INT NOT NULL,
      rating DECIMAL(2,1) DEFAULT 0.0,
      price DECIMAL(10,2) NOT NULL,
      bookings INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const [admins] = await pool.query('SELECT id FROM admin LIMIT 1');
  if (admins.length === 0) {
    const defaultPasswordHash = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO admin (username, password) VALUES (?, ?)',
      ['admin', defaultPasswordHash]
    );
    logger.info('Seeded default admin account (username: admin)');
  }

  logger.info('Database schema initialized successfully.');
}

module.exports = { pool, initDb };
