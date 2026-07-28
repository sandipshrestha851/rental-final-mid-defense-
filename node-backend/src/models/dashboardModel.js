const { pool } = require('../config/database');

async function getStats(landlordId, filters = {}) {
  const { startDate, endDate, propertyId, status } = filters;
  const conditions = ['p.landlord_id = ?'];
  const params = [landlordId];
  if (startDate) { conditions.push('b.created_at >= ?'); params.push(startDate); }
  if (endDate) { conditions.push('b.created_at <= ?'); params.push(endDate); }
  if (propertyId) { conditions.push('b.property_id = ?'); params.push(propertyId); }
  if (status) { conditions.push('b.status = ?'); params.push(status); }

  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
            SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN b.status IN ('cancelled','cancelled_by_landlord','cancelled_by_tenant') THEN 1 ELSE 0 END) AS cancelled,
            SUM(CASE WHEN b.status = 'rejected' THEN 1 ELSE 0 END) AS rejected
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE ${conditions.join(' AND ')}`,
    params
  );
  return { total: Number(row.total), pending: Number(row.pending), confirmed: Number(row.confirmed), completed: Number(row.completed), cancelled: Number(row.cancelled), rejected: Number(row.rejected) };
}

async function getRevenue(landlordId) {
  const [[{ totalRevenue }]] = await pool.query(
    `SELECT COALESCE(SUM(b.total_price), 0) AS totalRevenue FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.landlord_id = ? AND b.status IN ('confirmed', 'completed')`,
    [landlordId]
  );

  const [[{ ytdRevenue }]] = await pool.query(
    `SELECT COALESCE(SUM(b.total_price), 0) AS ytdRevenue FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.landlord_id = ? AND b.status IN ('confirmed', 'completed')
     AND YEAR(b.created_at) = YEAR(CURDATE())`,
    [landlordId]
  );

  const [[{ avgValue }]] = await pool.query(
    `SELECT COALESCE(AVG(b.total_price), 0) AS avgValue FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.landlord_id = ? AND b.status IN ('confirmed', 'completed')`,
    [landlordId]
  );

  const monthly = await pool.query(
    `SELECT DATE_FORMAT(b.created_at, '%Y-%m') AS month,
            COALESCE(SUM(b.total_price), 0) AS revenue,
            COUNT(*) AS bookings
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.landlord_id = ? AND b.status IN ('confirmed', 'completed')
     AND b.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(b.created_at, '%Y-%m')
     ORDER BY month ASC`,
    [landlordId]
  );

  return {
    totalRevenue,
    ytdRevenue,
    averageBookingValue: Math.round(avgValue * 100) / 100,
    monthly: monthly[0],
  };
}

async function getOccupancy(landlordId) {
  const [properties] = await pool.query(
    `SELECT id, title, created_at FROM properties WHERE landlord_id = ?`,
    [landlordId]
  );

  const totalDays = 365;
  let totalOccupiedDays = 0;
  let totalAvailableDays = 0;
  const perProperty = [];

  for (const prop of properties) {
    const [bookings] = await pool.query(
      `SELECT check_in, check_out FROM bookings
       WHERE property_id = ? AND status IN ('confirmed', 'completed')
       AND check_out >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)`,
      [prop.id]
    );

    let occupiedDays = 0;
    for (const b of bookings) {
      const start = new Date(b.check_in);
      const end = new Date(b.check_out);
      occupiedDays += Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    }

    const daysSinceCreated = Math.max(1, Math.ceil((Date.now() - new Date(prop.created_at).getTime()) / (1000 * 60 * 60 * 24)));
    const available = Math.min(totalDays, daysSinceCreated);
    const rate = available > 0 ? Math.round((occupiedDays / available) * 100) : 0;

    totalOccupiedDays += occupiedDays;
    totalAvailableDays += available;

    perProperty.push({
      propertyId: prop.id,
      title: prop.title,
      occupiedDays,
      availableDays: available,
      occupancyRate: rate,
    });
  }

  const overallRate = totalAvailableDays > 0
    ? Math.round((totalOccupiedDays / totalAvailableDays) * 100)
    : 0;

  return {
    overallOccupancyRate: overallRate,
    totalOccupiedDays,
    totalAvailableDays,
    perProperty,
  };
}

async function getPropertyAnalytics(landlordId) {
  const [properties] = await pool.query(
    `SELECT p.id, p.title,
            (SELECT COUNT(*) FROM property_views pv WHERE pv.property_id = p.id) AS views,
            (SELECT COUNT(*) FROM bookings b WHERE b.property_id = p.id AND b.status IN ('confirmed', 'completed')) AS bookings_count
     FROM properties p WHERE p.landlord_id = ?`,
    [landlordId]
  );

  const totalViews = properties.reduce((sum, p) => sum + Number(p.views), 0);
  const sorted = [...properties].sort((a, b) => Number(b.views) - Number(a.views));
  const mostViewed = sorted.length > 0 ? { id: sorted[0].id, title: sorted[0].title, views: Number(sorted[0].views) } : null;
  const leastViewed = sorted.length > 0 ? { id: sorted[sorted.length - 1].id, title: sorted[sorted.length - 1].title, views: Number(sorted[sorted.length - 1].views) } : null;

  return {
    totalViews,
    mostViewed,
    leastViewed,
    properties: properties.map(p => ({
      id: p.id,
      title: p.title,
      views: Number(p.views),
      bookings: Number(p.bookings_count),
    })),
  };
}

async function getBookingTrends(landlordId, period, startDate, endDate) {
  let dateFormat;
  let interval;
  switch (period) {
    case 'daily': dateFormat = '%Y-%m-%d'; interval = 'DAY'; break;
    case 'weekly': dateFormat = '%Y-%u'; interval = 'WEEK'; break;
    default: dateFormat = '%Y-%m'; interval = 'MONTH';
  }

  const start = startDate || '1900-01-01';
  const end = endDate || '2099-12-31';

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(b.created_at, ?) AS label,
            COUNT(*) AS bookings,
            COALESCE(SUM(b.total_price), 0) AS revenue
     FROM bookings b
     JOIN properties p ON b.property_id = p.id
     WHERE p.landlord_id = ? AND b.created_at >= ? AND b.created_at <= ?
     AND b.status IN ('confirmed', 'completed')
     GROUP BY label
     ORDER BY label ASC`,
    [dateFormat, landlordId, start, end]
  );

  return rows;
}

async function trackPropertyView(propertyId) {
  await pool.query(
    'INSERT INTO property_views (property_id) VALUES (?)',
    [propertyId]
  );
}

async function getReviewsByLandlord(landlordId, filters = {}) {
  const { sortBy, sortOrder, search, rating } = filters;
  const conditions = ['p.landlord_id = ?'];
  const params = [landlordId];
  if (search) { conditions.push('(u.full_name LIKE ? OR p.title LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (rating) { conditions.push('r.rating = ?'); params.push(Number(rating)); }

  const validSort = { date: 'r.created_at', rating: 'r.rating' };
  const orderCol = validSort[sortBy] || 'r.created_at';
  const orderDir = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const [rows] = await pool.query(
    `SELECT r.id, r.property_id, r.user_id, r.rating, r.comment, r.created_at,
            u.full_name AS guest_name,
            p.title AS property_title,
            rr.id AS reply_id, rr.reply AS reply_text, rr.created_at AS reply_created_at, rr.updated_at AS reply_updated_at
     FROM reviews r
     JOIN properties p ON r.property_id = p.id
     JOIN users u ON r.user_id = u.id
     LEFT JOIN review_replies rr ON rr.review_id = r.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY ${orderCol} ${orderDir}`,
    params
  );
  return rows;
}

async function getReviewsByProperty(propertyId) {
  const [rows] = await pool.query(
    `SELECT r.id, r.property_id, r.user_id, r.rating, r.comment, r.created_at,
            u.full_name AS guest_name,
            p.title AS property_title,
            rr.id AS reply_id, rr.reply AS reply_text, rr.created_at AS reply_created_at, rr.updated_at AS reply_updated_at
     FROM reviews r
     JOIN properties p ON r.property_id = p.id
     JOIN users u ON r.user_id = u.id
     LEFT JOIN review_replies rr ON rr.review_id = r.id
     WHERE r.property_id = ?
     ORDER BY r.created_at DESC`,
    [propertyId]
  );
  return rows;
}

async function recalculatePropertyRating(propertyId) {
  const [[{ avgRating, cnt }]] = await pool.query(
    `SELECT COALESCE(ROUND(AVG(rating), 1), 0) AS avgRating, COUNT(*) AS cnt FROM reviews WHERE property_id = ?`,
    [propertyId]
  );
  await pool.query(
    'UPDATE properties SET rating = ?, review_count = ? WHERE id = ?',
    [avgRating, cnt, propertyId]
  );
}

async function createReview(propertyId, userId, rating, comment) {
  const [result] = await pool.query(
    'INSERT INTO reviews (property_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [propertyId, userId, rating, comment]
  );
  await recalculatePropertyRating(propertyId);
  return result.insertId;
}

async function updateReview(reviewId, propertyId, rating, comment) {
  await pool.query(
    'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?',
    [rating, comment, reviewId]
  );
  await recalculatePropertyRating(propertyId);
}

async function deleteReview(reviewId) {
  const [[{ property_id }]] = await pool.query(
    'SELECT property_id FROM reviews WHERE id = ?', [reviewId]
  );
  if (!property_id) return;
  await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
  await recalculatePropertyRating(property_id);
}

async function createReply(reviewId, userId, reply) {
  const [result] = await pool.query(
    'INSERT INTO review_replies (review_id, user_id, reply) VALUES (?, ?, ?)',
    [reviewId, userId, reply]
  );
  return result.insertId;
}

async function updateReply(replyId, reply) {
  await pool.query(
    'UPDATE review_replies SET reply = ? WHERE id = ?',
    [reply, replyId]
  );
}

async function deleteReply(replyId) {
  await pool.query('DELETE FROM review_replies WHERE id = ?', [replyId]);
}

async function getReviewById(reviewId) {
  const [rows] = await pool.query(
    `SELECT r.*, u.full_name AS guest_name, p.title AS property_title
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN properties p ON r.property_id = p.id
     WHERE r.id = ?`,
    [reviewId]
  );
  return rows[0];
}

async function getReplyById(replyId) {
  const [rows] = await pool.query('SELECT * FROM review_replies WHERE id = ?', [replyId]);
  return rows[0];
}

async function getActiveListings(landlordId) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM properties WHERE landlord_id = ? AND status = 'Active'`,
    [landlordId]
  );
  return count;
}

module.exports = {
  getStats,
  getRevenue,
  getOccupancy,
  getPropertyAnalytics,
  getBookingTrends,
  trackPropertyView,
  getReviewsByLandlord,
  getReviewsByProperty,
  createReview,
  updateReview,
  deleteReview,
  createReply,
  updateReply,
  deleteReply,
  getReviewById,
  getReplyById,
  getActiveListings,
  recalculatePropertyRating,
};
