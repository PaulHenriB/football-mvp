const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database connection settings
const sequelize = new Sequelize(
  process.env.PG_DATABASE || 'football_mvp', // Database name
  process.env.PG_USER || 'postgres',         // Database user
  process.env.PG_PASSWORD || '04141822',     // Database password
  {
    host: process.env.PG_HOST || 'localhost', // Database host
    port: process.env.PG_PORT || 5432,       // Database port
    dialect: 'postgres',                     // Dialect for Sequelize
    logging: false,                          // Disable logging (optional)
    pool: {
      max: 30,                               // Max number of connections in pool
      min: 0,                                // Min number of connections in pool
      acquire: 30000,                        // Max time (ms) to wait for a connection
      idle: 10000                            // Max time (ms) a connection can be idle
    }
  }
);

// Test database connection
(async () => {
  try {
    await sequelize.authenticate(); // Authenticate the Sequelize connection
    console.log('✅ Connected to PostgreSQL with Sequelize');
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message || err);
    process.exit(1); // Exit if database connection fails
  }
})();

module.exports = sequelize;
