const { z } = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getDB } = require('../db');
const { JWT_SECRET } = require('../middlewares/auth');

// email — valid format, normalized
// password — min 8 chars, 1 uppercase, 1 number
const signupSchema = z.object({
  body: z.object({
    email: z.string().email().transform(e => e.toLowerCase().trim()),
    password: z.string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z.string().min(1),
    role: z.enum(['admin', 'user']).optional().default('user')
  }),
  query: z.any(),
  params: z.any()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().transform(e => e.toLowerCase().trim()),
    password: z.string()
  }),
  query: z.any(),
  params: z.any()
});

const signup = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const db = getDB();

    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // Passwords hashed with bcrypt (min 12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await db.run(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, email, passwordHash, name, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDB();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // JWT with 8h expiry
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const db = getDB();
    const user = await db.get('SELECT id, email, name, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signupSchema,
  loginSchema,
  signup,
  login,
  getMe
};
