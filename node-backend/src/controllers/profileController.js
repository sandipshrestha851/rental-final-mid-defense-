const bcrypt = require('bcryptjs');
const fs = require('fs/promises');
const path = require('path');
const { pool } = require('../config/database');
const userModel = require('../models/userModel');
const authService = require('../services/authService');

const avatarPath = (avatar) => avatar ? path.join(__dirname, '../../uploads/avatars', path.basename(avatar)) : null;
const removeAvatar = async (avatar) => { const file = avatarPath(avatar); if (file) await fs.unlink(file).catch(() => {}); };
const fail = (message, status = 400) => { const error = new Error(message); error.status = status; return error; };

exports.getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) throw fail('User not found', 404);
    const [[bookingStats]] = await pool.query(`SELECT COUNT(*) totalBookings, SUM(status = 'completed') completedBookings, SUM(status IN ('cancelled','cancelled_by_tenant','cancelled_by_landlord','expired')) cancelledBookings FROM bookings WHERE guest_id = ? OR property_id IN (SELECT id FROM properties WHERE landlord_id = ?)`, [req.userId, req.userId]);
    const [[propertyStats]] = await pool.query('SELECT COUNT(*) totalProperties FROM properties WHERE landlord_id = ?', [req.userId]);
    res.json({ user, stats: { totalProperties: Number(propertyStats.totalProperties || 0), totalBookings: Number(bookingStats.totalBookings || 0), completedBookings: Number(bookingStats.completedBookings || 0), cancelledBookings: Number(bookingStats.cancelledBookings || 0) } });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, address, bio, date_of_birth } = req.body;
    if (!String(full_name || '').trim() || String(full_name).trim().length > 100 || !/^[\p{L}\s.'-]+$/u.test(String(full_name).trim())) throw fail('Enter a valid full name.');
    if (phone && !/^[\d\s\-+()]{7,20}$/.test(phone)) throw fail('Invalid phone number format.');
    if (address && String(address).length > 255) throw fail('Address must be under 255 characters.');
    if (bio && String(bio).length > 500) throw fail('Bio must be under 500 characters.');
    if (date_of_birth && Number.isNaN(Date.parse(date_of_birth))) throw fail('Invalid date of birth.');
    const user = await userModel.updateProfile(req.userId, { full_name: String(full_name).trim(), phone, address, bio, date_of_birth });
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) { next(err); }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw fail('Please select an image to upload.');
    const existing = await userModel.findById(req.userId);
    const avatar = `/uploads/avatars/${req.file.filename}`;
    const user = await userModel.updateAvatar(req.userId, avatar);
    await removeAvatar(existing.avatar);
    res.status(201).json({ message: 'Avatar updated successfully', user });
  } catch (err) { if (req.file) await fs.unlink(req.file.path).catch(() => {}); next(err); }
};

exports.deleteAvatar = async (req, res, next) => {
  try { const user = await userModel.findById(req.userId); await userModel.updateAvatar(req.userId, null); await removeAvatar(user.avatar); res.json({ message: 'Avatar removed successfully' }); } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) throw fail('All password fields are required.');
    if (newPassword !== confirmPassword) throw fail('New passwords do not match.');
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(newPassword)) throw fail('New password must be at least 8 characters and include uppercase, lowercase, number, and special character.');
    const user = await userModel.findByEmail(req.email);
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) throw fail('Current password is incorrect.', 401);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(newPassword, 12), req.userId]);
    await pool.query('DELETE FROM refresh_tokens WHERE user_id = ?', [req.userId]);
    authService.clearAuthCookies(res);
    res.json({ message: 'Password changed. Please sign in again.' });
  } catch (err) { next(err); }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { currentPassword } = req.body;
    if (!currentPassword) throw fail('Current password is required.');
    const user = await userModel.findByEmail(req.email);
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) throw fail('Current password is incorrect.', 401);
    const [[booked]] = await pool.query('SELECT COUNT(*) count FROM bookings b JOIN properties p ON b.property_id = p.id WHERE p.landlord_id = ?', [req.userId]);
    if (Number(booked.count) > 0) throw fail('Your account cannot be deleted while your properties have booking records. Contact support for assistance.', 409);
    await pool.query('DELETE FROM users WHERE id = ?', [req.userId]);
    await removeAvatar(user.avatar);
    authService.clearAuthCookies(res);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) { next(err); }
};
