require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma'); // Prisma client

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test DB connection
(async () => {
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL with Prisma');
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message || err);
    process.exit(1);
  }
})();

// Default route
app.get('/', (req, res) => {
  res.send('⚽ Welcome to the Football MVP API');
});

// Health Check
const statusRoutes = require('./routes/status');
app.use('/api/status', validateRouter(statusRoutes, 'statusRoutes'));

// Other Routes
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groups');
const matchRoutes = require('./routes/matches');
const playerRoutes = require('./routes/players'); // Add this line

app.use('/api/users', validateRouter(userRoutes, 'userRoutes'));
app.use('/api/groups', validateRouter(groupRoutes, 'groupRoutes'));
app.use('/api/matches', validateRouter(matchRoutes, 'matchRoutes'));
app.use('/api/players', validateRouter(playerRoutes, 'playerRoutes')); // Register player routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Route Validator
function validateRouter(router, name) {
  if (router && typeof router === 'function') {
    return router;
  } else {
    console.error(`❌ Invalid Router: ${name} is not a function`);
    return (req, res) => res.status(500).json({ error: `${name} is not a valid Express router` });
  }
}
