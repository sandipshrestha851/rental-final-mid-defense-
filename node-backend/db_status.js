require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'room_rental',
  });

  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', tables.map(t => Object.values(t)[0]));

    const [columns] = await pool.query('DESCRIBE bookings');
    console.log('\nBookings table columns:');
    console.table(columns);

    const [users] = await pool.query('SELECT id, full_name, email, role FROM users');
    console.log('\nUsers:');
    console.table(users);

    const [properties] = await pool.query('SELECT id, landlord_id, title FROM properties');
    console.log('\nProperties:');
    console.table(properties);

    const [bookings] = await pool.query('SELECT * FROM bookings');
    console.log('\nBookings:');
    console.table(bookings);

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await pool.end();
  }
}

main();
