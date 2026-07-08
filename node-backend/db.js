// db.js
// MySQL connection pool + schema initialization (XAMPP friendly).

const mysql = require("mysql2/promise");

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || ""; // XAMPP default: empty password
const DB_NAME = process.env.DB_NAME || "chat_app";

// A shared connection pool used by the whole app.
const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // DATETIME/TIMESTAMP come back as JS Date objects, which JSON.stringify
  // turns into ISO strings — exactly what the frontend expects.
});

// Ensure the database and tables exist. Safe to run on every startup.
async function initDb() {
  console.log("Initializing database schema...");

  // Step 1: connect WITHOUT selecting a database so we can create it.
  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });
  await rootConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await rootConn.end();

  // Step 2: create tables inside the database using the pool.
  // Users now store full profile details collected at registration.
  // Login is performed with `email` (unique), not a username.
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

  console.log("Database schema initialized successfully.");
}

module.exports = { pool, initDb };
