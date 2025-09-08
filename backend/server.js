const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Import routes
const authRoutes = require("./routes/auth");          // Handles register, login, /me
const matchRoutes = require("./routes/matches");      // /matches/create, /matches/:id/join, etc.
const playerRoutes = require("./routes/players");     // /players/:id
const availabilityRoutes = require("./routes/availability"); // /availability
const teamBalanceRoutes = require("./routes/teamBalance");   // /team-balance

const app = express();

// === Middleware ===
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// === Routes ===
app.use("/auth", authRoutes);        // register, login, /me
app.use("/matches", matchRoutes);
app.use("/players", playerRoutes);
app.use("/availability", availabilityRoutes);
app.use("/team-balance", teamBalanceRoutes);

// === Health Check ===
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

// === Start Server & DB Connection ===
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL with Prisma");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

