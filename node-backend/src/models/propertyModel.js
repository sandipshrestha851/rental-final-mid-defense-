const { pool } = require('../config/database');

async function findByLandlordId(landlordId) {
  const [rows] = await pool.query(
    'SELECT * FROM properties WHERE landlord_id = ? ORDER BY created_at DESC',
    [landlordId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM properties WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create(data) {
  await pool.query(
    `INSERT INTO properties (
      id, landlord_id, title, description, location, category,
      address, city, state, zip_code, country, image_url, status,
      beds, baths, guests, sqft, rating, price, bookings,
      amenities, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.landlord_id,
      data.title,
      data.description || null,
      data.location,
      data.category || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.zip_code || null,
      data.country || null,
      data.image_url || '',
      data.status || 'Pending',
      data.beds,
      data.baths,
      data.guests || null,
      data.sqft || null,
      data.rating || 0,
      data.price,
      data.bookings || 0,
      data.amenities || null,
      data.photos || null,
    ]
  );
  return findById(data.id);
}

async function update(id, data) {
  const fields = [];
  const values = [];

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(
    `UPDATE properties SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM properties WHERE id = ?', [id]);
}

async function findAll() {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email
     FROM properties p
     LEFT JOIN users u ON p.landlord_id = u.id
     ORDER BY p.created_at DESC`
  );
  return rows;
}

module.exports = { findByLandlordId, findById, create, update, remove, findAll };
