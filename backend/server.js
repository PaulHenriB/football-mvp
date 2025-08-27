// backend/server.js
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import routes
const authRoutes = require("./routes/auth");       // handles /auth/register + /auth/login
const matchRoutes = require("./routes/matches");   // handles /matches/create, /matches/:id/join, /matches/:id/rate, /matches/open
const playerRoutes = require("./routes/players"); // handles /players/:id

const app = express();

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// === Routes ===
app.use("/auth", authRoutes);
app.use("/matches", matchRoutes);
app.use("/players", playerRoutes);

// === Health Check (optional) ===
app.get("/", (req, res) => {
  res.json({ message: "NextPlay API is running 🚀" });
});

// === Error Handling Middleware ===
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL with Prisma");
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
});
