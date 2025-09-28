import express from 'express';
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';

const router = express.Router();

// Public test route
router.get('/public', (req, res) => res.json({ message: 'Public route' }));

// Authenticated route
router.get('/auth', authenticate, (req, res) => res.json({ message: 'Auth route', user: req.user }));

// Admin-only route
router.get('/alumni', authenticate, authorizeRoles('ALUMNI'), (req, res) => res.json({ message: 'Alumni route', user: req.user }));

export default router;
