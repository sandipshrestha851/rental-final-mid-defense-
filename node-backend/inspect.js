require('dotenv').config();
const { initDb } = require('./src/config/database');

async function main() {
  try {
    await initDb();
    console.log('Database initialized and upgraded successfully!');
  } catch (err) {
    console.error('Initialization error:', err.message);
  } finally {
    process.exit(0);
  }
}

main();
