const { pool } = require('../config/database');

async function findByLandlordId(landlordId) {
  const [rows] = await pool.query(
    `SELECT p.*,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
     FROM properties p WHERE p.landlord_id = ? ORDER BY p.created_at DESC`,
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
      id, landlord_id, title, description, location, category, property_type,
      address, city, state, zip_code, country, image_url, status,
      beds, baths, guests, sqft, rating, price, bookings,
      amenities, photos
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id, data.landlord_id, data.title, data.description || null,
      data.location, data.category || null, data.property_type || null,
      data.address || null, data.city || null, data.state || null,
      data.zip_code || null, data.country || null, data.image_url || '',
      data.status || 'Pending', data.beds, data.baths, data.guests || null,
      data.sqft || null, data.rating || 0, data.price, data.bookings || 0,
      data.amenities || null, data.photos || null,
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
  await pool.query(`UPDATE properties SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM properties WHERE id = ?', [id]);
}

async function findAll() {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
     FROM properties p LEFT JOIN users u ON p.landlord_id = u.id
     ORDER BY p.created_at DESC`
  );
  return rows;
}

async function findAllActive() {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
     FROM properties p LEFT JOIN users u ON p.landlord_id = u.id
     WHERE p.status = 'Active' ORDER BY p.created_at DESC`
  );
  return rows;
}

async function searchActive({ keyword, minPrice, maxPrice, category, propertyType, beds, baths, minGuests, amenities, city, sort, page, pageSize }) {
  let sql = `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
    FROM properties p LEFT JOIN users u ON p.landlord_id = u.id WHERE p.status = 'Active'`;
  let countSql = `SELECT COUNT(*) AS total FROM properties p WHERE p.status = 'Active'`;
  const params = [];
  const countParams = [];

  if (keyword) {
    const k = `%${keyword}%`;
    const clause = ` AND (p.title LIKE ? OR p.description LIKE ? OR p.location LIKE ? OR p.city LIKE ? OR p.address LIKE ?)`;
    sql += clause;
    countSql += clause;
    params.push(k, k, k, k, k);
    countParams.push(k, k, k, k, k);
  }

  if (city) {
    sql += ` AND p.city LIKE ?`;
    countSql += ` AND p.city LIKE ?`;
    params.push(`%${city}%`);
    countParams.push(`%${city}%`);
  }

  if (minPrice != null) {
    sql += ` AND p.price >= ?`;
    countSql += ` AND p.price >= ?`;
    params.push(Number(minPrice));
    countParams.push(Number(minPrice));
  }

  if (maxPrice != null) {
    sql += ` AND p.price <= ?`;
    countSql += ` AND p.price <= ?`;
    params.push(Number(maxPrice));
    countParams.push(Number(maxPrice));
  }

  if (category) {
    sql += ` AND p.category = ?`;
    countSql += ` AND p.category = ?`;
    params.push(category);
    countParams.push(category);
  }

  if (propertyType) {
    sql += ` AND p.property_type = ?`;
    countSql += ` AND p.property_type = ?`;
    params.push(propertyType);
    countParams.push(propertyType);
  }

  if (beds != null) {
    sql += ` AND p.beds >= ?`;
    countSql += ` AND p.beds >= ?`;
    params.push(Number(beds));
    countParams.push(Number(beds));
  }

  if (baths != null) {
    sql += ` AND p.baths >= ?`;
    countSql += ` AND p.baths >= ?`;
    params.push(Number(baths));
    countParams.push(Number(baths));
  }

  if (minGuests != null) {
    sql += ` AND p.guests >= ?`;
    countSql += ` AND p.guests >= ?`;
    params.push(Number(minGuests));
    countParams.push(Number(minGuests));
  }

  if (amenities && amenities.length > 0) {
    for (const a of amenities) {
      sql += ` AND JSON_CONTAINS(p.amenities, ?)`;
      countSql += ` AND JSON_CONTAINS(p.amenities, ?)`;
      params.push(JSON.stringify(a));
      countParams.push(JSON.stringify(a));
    }
  }

  const sortMap = {
    newest: 'p.created_at DESC',
    oldest: 'p.created_at ASC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    rating: 'p.rating DESC',
    popular: 'p.bookings DESC',
    alphabetical: 'p.title ASC',
  };
  sql += ` ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;

  const p = Math.max(1, parseInt(page) || 1);
  const ps = Math.min(50, Math.max(1, parseInt(pageSize) || 12));
  const offset = (p - 1) * ps;
  sql += ` LIMIT ? OFFSET ?`;
  params.push(ps, offset);

  const [countResult] = await pool.query(countSql, countParams);
  const total = countResult[0].total;
  const [rows] = await pool.query(sql, params);

  return { properties: rows, total, page: p, pageSize: ps, totalPages: Math.ceil(total / ps) };
}

async function getImages(propertyId) {
  const [rows] = await pool.query(
    'SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order ASC, id ASC',
    [propertyId]
  );
  return rows;
}

async function addImage(propertyId, imageUrl) {
  const [maxRows] = await pool.query(
    'SELECT COALESCE(MAX(sort_order) + 1, 0) AS next_order FROM property_images WHERE property_id = ?',
    [propertyId]
  );
  const nextOrder = maxRows[0].next_order;
  const [result] = await pool.query(
    'INSERT INTO property_images (property_id, image_url, sort_order) VALUES (?, ?, ?)',
    [propertyId, imageUrl, nextOrder]
  );
  return result.insertId;
}

async function removeImage(imageId) {
  await pool.query('DELETE FROM property_images WHERE id = ?', [imageId]);
}

async function updateImageOrder(propertyId, imageIds) {
  for (let i = 0; i < imageIds.length; i++) {
    await pool.query(
      'UPDATE property_images SET sort_order = ? WHERE id = ? AND property_id = ?',
      [i, imageIds[i], propertyId]
    );
  }
}

async function addToWishlist(userId, propertyId) {
  await pool.query(
    'INSERT IGNORE INTO wishlist (user_id, property_id) VALUES (?, ?)',
    [userId, propertyId]
  );
}

async function removeFromWishlist(userId, propertyId) {
  await pool.query(
    'DELETE FROM wishlist WHERE user_id = ? AND property_id = ?',
    [userId, propertyId]
  );
}

async function getWishlist(userId) {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
     FROM wishlist w JOIN properties p ON w.property_id = p.id
     LEFT JOIN users u ON p.landlord_id = u.id
     WHERE w.user_id = ? ORDER BY w.created_at DESC`,
    [userId]
  );
  return rows;
}

async function isWishlisted(userId, propertyId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM wishlist WHERE user_id = ? AND property_id = ?',
    [userId, propertyId]
  );
  return rows.length > 0;
}

async function getWishlistIds(userId) {
  const [rows] = await pool.query(
    'SELECT property_id FROM wishlist WHERE user_id = ?',
    [userId]
  );
  return rows.map(r => r.property_id);
}

async function trackRecentlyViewed(userId, propertyId) {
  await pool.query(
    'DELETE FROM recently_viewed WHERE user_id = ? AND property_id = ?',
    [userId, propertyId]
  );
  await pool.query(
    'INSERT INTO recently_viewed (user_id, property_id) VALUES (?, ?)',
    [userId, propertyId]
  );
  await pool.query(
    `DELETE FROM recently_viewed WHERE user_id = ? AND id NOT IN (
      SELECT id FROM (SELECT id FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 10) AS r
    )`,
    [userId, userId]
  );
}

async function getRecentlyViewed(userId) {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
     FROM recently_viewed rv JOIN properties p ON rv.property_id = p.id
     LEFT JOIN users u ON p.landlord_id = u.id
     WHERE rv.user_id = ? ORDER BY rv.viewed_at DESC LIMIT 10`,
    [userId]
  );
  return rows;
}

async function findSimilar(property, limit = 6) {
  let sql = `SELECT p.*, u.full_name AS landlord_name, u.email AS landlord_email,
      COALESCE(
        (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.id ORDER BY pi.sort_order ASC, pi.id ASC LIMIT 1),
        p.image_url, ''
      ) AS image_url
    FROM properties p LEFT JOIN users u ON p.landlord_id = u.id
    WHERE p.status = 'Active' AND p.id != ?`;
  const params = [property.id];
  const clauses = [];
  if (property.city) { clauses.push(`p.city = ?`); params.push(property.city); }
  if (property.category) { clauses.push(`p.category = ?`); params.push(property.category); }
  if (property.property_type) { clauses.push(`p.property_type = ?`); params.push(property.property_type); }
  if (clauses.length > 0) sql += ` AND (${clauses.join(' OR ')})`;
  sql += ` ORDER BY `;
  if (property.price) sql += `ABS(p.price - ?) ASC, `;
  params.push(property.price);
  sql += `p.rating DESC LIMIT ?`;
  params.push(limit);
  const [rows] = await pool.query(sql, params);
  return rows;
}

module.exports = {
  findByLandlordId, findById, create, update, remove, findAll, findAllActive,
  searchActive, getImages, addImage, removeImage, updateImageOrder,
  addToWishlist, removeFromWishlist, getWishlist, isWishlisted, getWishlistIds,
  trackRecentlyViewed, getRecentlyViewed, findSimilar,
};
