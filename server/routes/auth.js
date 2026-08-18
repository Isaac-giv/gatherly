import express from 'express';
import jwt from 'jsonwebtoken';
import { memoryStore } from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gatherly_super_secret_jwt_key_2026';

// Register User
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = memoryStore.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const newUser = memoryStore.addUser({
      name,
      email,
      password,
      role: role || 'ATTENDEE',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login User
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = memoryStore.findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Switch persona shortcut (for easy demo testing between Organizer & Attendee)
router.post('/switch-persona', (req, res) => {
  try {
    const { role } = req.body; // 'ORGANIZER' or 'ATTENDEE'
    const targetEmail = role === 'ORGANIZER' ? 'organizer@gatherly.io' : 'sarah@attendee.com';
    const user = memoryStore.findUserByEmail(targetEmail);
    if (!user) return res.status(404).json({ error: 'Default persona user not found' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Current User Session
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = memoryStore.findUserById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
