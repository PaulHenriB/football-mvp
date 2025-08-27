// /utils/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Middleware to authenticate user via JWT
 */
exports.authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded payload (id, email, role)
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

/**
 * Middleware for role-based access control
 * Usage: router.post('/admin', authenticate, authorizeRole(['ADMIN']), handler)
 */
exports.authorizeRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient rights" });
    }
    next();
  };
};
