// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware'); // JWT middleware

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', authenticateToken, me);

module.exports = router;
