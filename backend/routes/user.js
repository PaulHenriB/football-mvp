// backend/routes/user.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../utils/authMiddleware");

/**
 * @route GET /api/users/me
 * @desc Get logged-in user info
 * @access Private
 */
router.get("/me", authenticate, (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (err) {
    console.error("Error in /me route:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
