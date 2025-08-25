const express = require('express');
const router = express.Router();

// Simple health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: '✅ API is up and running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
