const pgp = require("pg-promise")();
require("dotenv").config();

// Database connection settings
const dbConfig = {
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || "football_mvp",
  user: process.env.PG_USER || "postgres",
  password: process.env.PG_PASSWORD || "04141822",
  max: 30, // Set a connection pool limit
};

const db = pgp(dbConfig);

// Test database connection
(async () => {
  try {
    await db.connect();
    console.log("✅ Connected to PostgreSQL");
  } catch (err) {
    console.error("❌ PostgreSQL connection error:", err.message || err);
    process.exit(1); // Stop the server if the database connection fails
  }
})();

module.exports = db;
