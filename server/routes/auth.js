import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { memoryStore } from '../db.js';
import { User } from '../models/Schemas.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gatherly_super_secret_jwt_key_2026';

const isMongoConnected = () => mongoose.connection.readyState === 1;

const makeToken = (user) =>
  jwt.sign({ id: user._id || user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const sanitizeUser = (user) => ({
  id: (user._id || user.id).toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
});

// ─── Register ───────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (isMongoConnected()) {
      // MongoDB path — bcrypt hashed passwords
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return res.status(400).json({ error: 'User with this email already exists' });

      const hashed = await bcrypt.hash(password, 12);
      const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashed,
        role: role || 'ATTENDEE',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      });

      return res.json({ token: makeToken(newUser), user: sanitizeUser(newUser) });
    }

    // In-memory fallback
    const existing = memoryStore.findUserByEmail(email);
    if (existing) return res.status(400).json({ error: 'User with this email already exists' });

    const newUser = memoryStore.addUser({
      name,
      email,
      password,
      role: role || 'ATTENDEE',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    res.json({ token: makeToken(newUser), user: sanitizeUser(newUser) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    if (isMongoConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

      return res.json({ token: makeToken(user), user: sanitizeUser(user) });
    }

    // In-memory fallback (plain text compare for seeded demo accounts)
    const user = memoryStore.findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ token: makeToken(user), user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Switch Persona (Demo shortcut) ─────────────────────────────────────────
router.post('/switch-persona', async (req, res) => {
  try {
    const { role } = req.body;
    const targetEmail = role === 'ORGANIZER' ? 'organizer@gatherly.io' : 'sarah@attendee.com';

    if (isMongoConnected()) {
      const user = await User.findOne({ email: targetEmail });
      if (!user) return res.status(404).json({ error: 'Demo persona not found in database' });
      return res.json({ token: makeToken(user), user: sanitizeUser(user) });
    }

    const user = memoryStore.findUserByEmail(targetEmail);
    if (!user) return res.status(404).json({ error: 'Default persona user not found' });

    res.json({ token: makeToken(user), user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Current Session ─────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isMongoConnected()) {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: sanitizeUser(user) });
    }

    const user = memoryStore.findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
