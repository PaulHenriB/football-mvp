// /utils/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Middleware to authenticate user via JWT
exports.authenticate = (req, res, next) => {
const authHeader = req.headers['authorization'];
const token = authHeader && authHeader.split(' ')[1];


if (!token) {
return res.status(401).json({ message: 'Access denied. No token provided.' });
}


try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // attach decoded user payload to request
next();
} catch (err) {
return res.status(403).json({ message: 'Invalid or expired token.' });
}
};


// Optional middleware for role-based access
exports.authorizeRole = (roles = []) => {
return (req, res, next) => {
if (!roles.includes(req.user.role)) {
return res.status(403).json({ message: 'Forbidden: insufficient rights' });
}
next();
};
};
