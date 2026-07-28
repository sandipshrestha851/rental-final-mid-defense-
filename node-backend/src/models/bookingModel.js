const { pool } = require('../config/database');

const BOOKING_COLUMNS = `b.id, b.property_id, b.guest_id, b.check_in AS checkIn, b.check_out AS checkOut, b.guests, b.total_price AS totalPrice, b.status, b.cancellation_reason AS cancellationReason, b.cancelled_at AS cancelledAt, b.cancelled_by AS cancelledBy, b.special_requests AS specialRequests, b.created_at`;

const BOOKING_JOINS = `FROM bookings b JOIN properties p ON b.property_id = p.id JOIN users u ON b.guest_id = u.id`;

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, p.rating, p.landlord_id AS landlordId, u.full_name AS guestName, u.email AS guestEmail, u.phone AS guestPhone ${BOOKING_JOINS} WHERE b.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByGuestId(guestId, status) {
  let sql = `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, p.rating, p.landlord_id AS landlordId, u.full_name AS guestName ${BOOKING_JOINS} WHERE b.guest_id = ?`;
  const params = [guestId];
  if (status && status !== 'all') {
    const statuses = status.split(',');
    sql += ` AND b.status IN (${statuses.map(() => '?').join(',')})`;
    params.push(...statuses);
  }
  sql += ' ORDER BY b.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findByLandlordId(landlordId, status) {
  let sql = `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, p.rating, u.full_name AS guestName, u.email AS guestEmail, u.phone AS guestPhone ${BOOKING_JOINS} WHERE p.landlord_id = ?`;
  const params = [landlordId];
  if (status && status !== 'all') {
    const statuses = status.split(',');
    sql += ` AND b.status IN (${statuses.map(() => '?').join(',')})`;
    params.push(...statuses);
  }
  sql += ' ORDER BY b.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findAll(status) {
  let sql = `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, p.rating, p.landlord_id AS landlordId, u.full_name AS guestName, u.email AS guestEmail, u.phone AS guestPhone, l.full_name AS landlordName, l.email AS landlordEmail ${BOOKING_JOINS} LEFT JOIN users l ON p.landlord_id = l.id`;
  const params = [];

  if (status && status !== 'all') {
    const statuses = status.split(',');
    sql += ` WHERE b.status IN (${statuses.map(() => '?').join(',')})`;
    params.push(...statuses);
  }

  sql += ' ORDER BY b.created_at DESC';
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO bookings (property_id, guest_id, check_in, check_out, guests, total_price, status, special_requests) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [data.propertyId, data.guestId, data.checkIn, data.checkOut, data.guests, data.totalAmount || data.totalPrice, data.specialRequests || null]
  );
  const bookingId = result.insertId;

  try {
    await pool.query('UPDATE properties SET bookings = bookings + 1 WHERE id = ?', [data.propertyId]);
  } catch (err) {
    console.error('Failed to increment bookings count for property', data.propertyId, err);
  }

  await addHistory(bookingId, 'pending', data.guestId, 'Booking created');
  return findById(bookingId);
}

async function updateStatus(id, status, changedBy, note) {
  const updateFields = ['status = ?'];
  const params = [status];

  if (['cancelled', 'cancelled_by_tenant', 'cancelled_by_landlord'].includes(status)) {
    updateFields.push('cancelled_at = NOW()');
    updateFields.push('cancelled_by = ?');
    params.push(changedBy ? String(changedBy) : null);
    if (note) {
      updateFields.push('cancellation_reason = ?');
      params.push(note);
    }
  }

  params.push(id);
  await pool.query(`UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`, params);

  await addHistory(id, status, changedBy, note || null);
  return findById(id);
}

async function addHistory(bookingId, status, changedBy, note) {
  try {
    await pool.query(
      'INSERT INTO booking_status_history (booking_id, status, changed_by, note) VALUES (?, ?, ?, ?)',
      [bookingId, status, changedBy || null, note || null]
    );
  } catch (err) {
    console.error('Failed to add booking history', err);
  }
}

async function getHistory(bookingId) {
  const [rows] = await pool.query(
    `SELECT id, status, changed_by AS changedBy, note, created_at AS createdAt FROM booking_status_history WHERE booking_id = ? ORDER BY created_at ASC`,
    [bookingId]
  );
  return rows;
}

async function checkAvailability(propertyId, checkIn, checkOut, excludeBookingId) {
  let sql = `SELECT COUNT(*) AS count FROM bookings WHERE property_id = ? AND status IN ('confirmed', 'pending') AND check_in < ? AND check_out > ?`;
  const params = [propertyId, checkOut, checkIn];

  if (excludeBookingId) {
    sql += ' AND id != ?';
    params.push(excludeBookingId);
  }

  const [rows] = await pool.query(sql, params);
  return rows[0].count === 0;
}

async function getUnavailableDates(propertyId) {
  const [rows] = await pool.query(
    `SELECT check_in AS start, check_out AS end FROM bookings WHERE property_id = ? AND status IN ('confirmed', 'pending') ORDER BY check_in ASC`,
    [propertyId]
  );
  return rows;
}

async function getStats(landlordId) {
  const [rows] = await pool.query(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
      SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN b.status IN ('cancelled','cancelled_by_tenant','cancelled_by_landlord') THEN 1 ELSE 0 END) AS cancelled,
      SUM(CASE WHEN b.status = 'rejected' THEN 1 ELSE 0 END) AS rejected,
      SUM(CASE WHEN DATE(b.check_in) = CURDATE() AND b.status = 'confirmed' THEN 1 ELSE 0 END) AS todayCheckIns,
      SUM(CASE WHEN DATE(b.check_out) = CURDATE() AND b.status = 'confirmed' THEN 1 ELSE 0 END) AS todayCheckOuts,
      SUM(CASE WHEN b.check_in <= CURDATE() AND b.check_out >= CURDATE() AND b.status = 'confirmed' THEN 1 ELSE 0 END) AS currentGuests,
      COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END), 0) AS revenue
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.landlord_id = ?`,
    [landlordId]
  );
  return rows[0];
}

async function findByDateRange(landlordId, startDate, endDate) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, u.full_name AS guestName ${BOOKING_JOINS} WHERE p.landlord_id = ? AND b.check_in >= ? AND b.check_out <= ? ORDER BY b.check_in ASC`,
    [landlordId, startDate, endDate]
  );
  return rows;
}

async function getTodayCheckIns(landlordId) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, u.full_name AS guestName ${BOOKING_JOINS} WHERE p.landlord_id = ? AND DATE(b.check_in) = CURDATE() AND b.status = 'confirmed' ORDER BY b.check_in ASC`,
    [landlordId]
  );
  return rows;
}

async function getTodayCheckOuts(landlordId) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, u.full_name AS guestName ${BOOKING_JOINS} WHERE p.landlord_id = ? AND DATE(b.check_out) = CURDATE() AND b.status = 'confirmed' ORDER BY b.check_out ASC`,
    [landlordId]
  );
  return rows;
}

async function getCurrentGuests(landlordId) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, p.image_url AS imageUrl, p.location, p.price, u.full_name AS guestName ${BOOKING_JOINS} WHERE p.landlord_id = ? AND b.check_in <= CURDATE() AND b.check_out >= CURDATE() AND b.status = 'confirmed' ORDER BY b.check_out ASC`,
    [landlordId]
  );
  return rows;
}

async function getRecentActivity(landlordId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT ${BOOKING_COLUMNS}, p.title AS propertyName, u.full_name AS guestName ${BOOKING_JOINS} WHERE p.landlord_id = ? ORDER BY b.created_at DESC LIMIT ?`,
    [landlordId, limit]
  );
  return rows;
}

module.exports = {
  findById, findByGuestId, findByLandlordId, findAll, create, updateStatus,
  addHistory, getHistory, checkAvailability, getUnavailableDates,
  getStats, findByDateRange, getTodayCheckIns, getTodayCheckOuts,
  getCurrentGuests, getRecentActivity,
};
