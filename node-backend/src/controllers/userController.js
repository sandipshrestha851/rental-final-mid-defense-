const userModel = require('../models/userModel');
const { isOnline } = require('../config/socket');
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const userController = {
  async getUsers(req, res) {
    try {
      const users = await userModel.findAllExcept(req.userId);
      const result = users.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        gender: u.gender,
        bio: u.bio,
        role: u.role,
        created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
        is_online: isOnline(u.id),
      }));
      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  },
};

async function getAdminUserDetails(req, res, next) {
  try {
    const id = Number(req.params.id);
    const [[user]] = await pool.query('SELECT id, full_name, email, phone, role, created_at, is_suspended FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const [bookings, properties, activity] = await Promise.all([
      pool.query(`SELECT b.id, b.status, b.check_in AS checkIn, b.check_out AS checkOut, b.total_price AS totalPrice, p.title AS propertyName FROM bookings b JOIN properties p ON p.id=b.property_id WHERE b.guest_id=? ORDER BY b.created_at DESC LIMIT 20`, [id]),
      pool.query('SELECT id, title, status, created_at FROM properties WHERE landlord_id = ? ORDER BY created_at DESC LIMIT 20', [id]),
      pool.query(`SELECT COUNT(*) totalBookings, SUM(status='completed') completedBookings, SUM(status IN ('cancelled','cancelled_by_tenant','cancelled_by_landlord','expired')) cancelledBookings FROM bookings WHERE guest_id=?`, [id]),
    ]);
    res.json({ user, bookings: bookings[0], properties: properties[0], activity: activity[0] });
  } catch (err) { next(err); }
}

async function setUserSuspension(req, res, next) {
  try {
    const id = Number(req.params.id); if (id === req.userId) return res.status(400).json({ message: 'You cannot suspend your own administrator account.' });
    await pool.query('UPDATE users SET is_suspended = ? WHERE id = ?', [req.body.suspended ? 1 : 0, id]);
    res.json({ message: req.body.suspended ? 'User suspended.' : 'User reactivated.' });
  } catch (err) { next(err); }
}

async function resetUserPassword(req, res, next) {
  try {
    const password = String(req.body.password || '');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) return res.status(400).json({ message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' });
    await pool.query('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 12), Number(req.params.id)]);
    await pool.query('DELETE FROM refresh_tokens WHERE user_id=?', [Number(req.params.id)]);
    res.json({ message: 'Password reset successfully. The user must sign in again.' });
  } catch (err) { next(err); }
}

async function deleteAdminUser(req, res, next) {
  try {
    const id = Number(req.params.id); if (id === req.userId) return res.status(400).json({ message: 'You cannot delete your own administrator account.' });
    const [[ownedBookings]] = await pool.query('SELECT COUNT(*) count FROM bookings b JOIN properties p ON p.id=b.property_id WHERE p.landlord_id=?', [id]);
    if (Number(ownedBookings.count)) return res.status(409).json({ message: 'Cannot delete a landlord with property booking records.' });
    const [result] = await pool.query('DELETE FROM users WHERE id=?', [id]); if (!result.affectedRows) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully.' });
  } catch (err) { next(err); }
}

userController.getAdminUserDetails = getAdminUserDetails;
userController.setUserSuspension = setUserSuspension;
userController.resetUserPassword = resetUserPassword;
userController.deleteAdminUser = deleteAdminUser;

module.exports = userController;
