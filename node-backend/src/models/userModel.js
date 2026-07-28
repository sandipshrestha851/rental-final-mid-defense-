const { pool } = require('../config/database');

const userModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, gender, date_of_birth, bio, address, avatar, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create({ full_name, email, phone, gender, date_of_birth, bio, role, password_hash }) {
    const [result] = await pool.query(
      `INSERT INTO users
        (full_name, email, phone, gender, date_of_birth, bio, role, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, phone, gender, date_of_birth, bio, role, password_hash]
    );
    return result.insertId;
  },

  async findAllExcept(excludeUserId) {
    const [users] = await pool.query(
      `SELECT id, full_name, email, phone, gender, bio, role, created_at
       FROM users
       WHERE id != ?
       ORDER BY full_name ASC`,
      [excludeUserId]
    );
    return users;
  },

  async findAdminByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    return rows[0];
  },

  async updateProfile(id, { full_name, phone, address, bio, date_of_birth }) {
    await pool.query('UPDATE users SET full_name = ?, phone = ?, address = ?, bio = ?, date_of_birth = ? WHERE id = ?', [full_name, phone || null, address || null, bio || null, date_of_birth || null, id]);
    return this.findById(id);
  },

  async updateAvatar(id, avatar) {
    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, id]);
    return this.findById(id);
  },
};

module.exports = userModel;
