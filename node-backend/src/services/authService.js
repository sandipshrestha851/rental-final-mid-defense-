const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const { signToken, signAdminToken } = require('../utils/jwt');

function orNull(value) {
  if (value === undefined || value === null) return null;
  const str = String(value).trim();
  return str.length ? str : null;
}

const authService = {
  async register(data) {
    const full_name = orNull(data.full_name);
    const email = data.email ? String(data.email).trim().toLowerCase() : '';
    const password = data.password ? String(data.password) : '';
    const phone = orNull(data.phone);
    const gender = orNull(data.gender);
    const date_of_birth = orNull(data.date_of_birth);
    const bio = orNull(data.bio);
    const role = orNull(data.role);

    if (!email || !password) {
      const err = new Error('Email and password are required');
      err.status = 400;
      throw err;
    }

    const existing = await userModel.findByEmail(email);
    if (existing) {
      const err = new Error('Email already registered');
      err.status = 409;
      throw err;
    }

    const password_hash = await bcrypt.hash(password, 10);
    await userModel.create({
      full_name, email, phone, gender, date_of_birth, bio, role, password_hash,
    });

    return { message: 'User registered successfully' };
  },

  async login(email, password) {
    if (!email || !password) {
      const err = new Error('Missing email or password');
      err.status = 400;
      throw err;
    }

    const user = await userModel.findByEmail(email.toLowerCase().trim());

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const token = signToken(user);
    return {
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async adminLogin(username, password) {
    if (!username || !password) {
      const err = new Error('Missing username or password');
      err.status = 400;
      throw err;
    }

    const admin = await userModel.findAdminByUsername(username.trim());

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      const err = new Error('Invalid credentials');
      err.status = 401;
      throw err;
    }

    const token = signAdminToken(admin);

    return {
      token,
      user: {
        id: admin.id,
        full_name: 'System Admin',
        email: `${admin.username}@admin.local`,
        role: 'admin',
      },
    };
  },
};

module.exports = authService;
