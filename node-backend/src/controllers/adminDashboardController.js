const { pool } = require('../config/database');

exports.getSummary = async (req, res, next) => {
  try {
    const [[users], [properties], [bookings], [reviews], [revenue]] = await Promise.all([
      pool.query(`SELECT COUNT(*) totalUsers, SUM(role = 'tenant') totalTenants, SUM(role = 'landlord') totalLandlords FROM users`),
      pool.query(`SELECT COUNT(*) totalProperties, SUM(status = 'Active') activeProperties, SUM(status = 'Pending') pendingProperties, SUM(status = 'Rejected') rejectedProperties FROM properties`),
      pool.query(`SELECT COUNT(*) totalBookings, SUM(status = 'pending') pendingBookings, SUM(status = 'confirmed') confirmedBookings, SUM(status = 'completed') completedBookings, SUM(status IN ('cancelled','cancelled_by_tenant','cancelled_by_landlord','expired')) cancelledBookings, COALESCE(AVG(total_price),0) averageBookingValue FROM bookings`),
      pool.query(`SELECT COUNT(*) totalReviews FROM reviews`),
      pool.query(`SELECT COALESCE(SUM(CASE WHEN status IN ('confirmed','completed') THEN total_price ELSE 0 END),0) totalRevenue, COALESCE(SUM(CASE WHEN status IN ('confirmed','completed') AND YEAR(created_at)=YEAR(CURDATE()) AND MONTH(created_at)=MONTH(CURDATE()) THEN total_price ELSE 0 END),0) monthlyRevenue FROM bookings`),
    ]);
    res.json({ ...users, ...properties, ...bookings, ...reviews, ...revenue });
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE' && /reviews/.test(err.message)) return res.status(200).json({ totalReviews: 0, totalUsers: 0, totalTenants: 0, totalLandlords: 0, totalProperties: 0, activeProperties: 0, pendingProperties: 0, rejectedProperties: 0, totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, completedBookings: 0, cancelledBookings: 0, averageBookingValue: 0, totalRevenue: 0, monthlyRevenue: 0 });
    next(err);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    const [revenue, users, bookings, properties] = await Promise.all([
      pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m') label, COALESCE(SUM(CASE WHEN status IN ('confirmed','completed') THEN total_price ELSE 0 END),0) revenue FROM bookings WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY label ORDER BY label`),
      pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m') label, SUM(role='tenant') tenants, SUM(role='landlord') landlords FROM users WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY label ORDER BY label`),
      pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m') label, SUM(status='pending') pending, SUM(status='confirmed') confirmed, SUM(status='completed') completed, SUM(status IN ('cancelled','cancelled_by_tenant','cancelled_by_landlord','expired')) cancelled FROM bookings WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY label ORDER BY label`),
      pool.query(`SELECT status, COUNT(*) count FROM properties GROUP BY status`),
    ]);
    res.json({ revenue: revenue[0], users: users[0], bookings: bookings[0], properties: properties[0] });
  } catch (err) { next(err); }
};
