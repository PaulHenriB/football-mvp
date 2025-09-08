// backend/routes/availability.js
const express = require('express');
const router = express.Router();
const {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability
} = require('../controllers/availabilityController');

// Middleware: ensure user is logged in
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.post('/', requireAuth, createAvailability);
router.get('/me', requireAuth, getMyAvailability);
router.put('/:id', requireAuth, updateAvailability);
router.delete('/:id', requireAuth, deleteAvailability);

module.exports = router;
