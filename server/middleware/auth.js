import jwt from 'jsonwebtoken';
import { memoryStore } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gatherly_super_secret_jwt_key_2026';

/**
 * Middleware: Verifies JWT and attaches user to req.user
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware: Restricts route to specific role(s)
 * Usage: requireRole('ORGANIZER') or requireRole(['ORGANIZER', 'ADMIN'])
 */
export const requireRole = (roles) => (req, res, next) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access denied',
      message: `This action requires one of the following roles: ${allowed.join(', ')}`
    });
  }
  next();
};
