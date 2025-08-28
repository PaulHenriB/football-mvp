// backend/routes/players.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// ==========================
// GET /players → list all players
// ==========================
router.get("/", async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        user: true,
        matches: {
          include: {
            match: true,
          },
        },
      },
    });
    res.json({
      message: "✅ Players retrieved successfully",
      players,
    });
  } catch (error) {
    console.error("❌ Error retrieving players:", error);
    res.status(500).json({ error: "Error retrieving players" });
  }
});

// ==========================
// GET /players/:id → fetch one player profile
// ==========================
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const player = await prisma.player.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: true,
        matches: {
          include: {
            match: true,
          },
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json({
      message: "✅ Player profile retrieved successfully",
      player,
    });
  } catch (error) {
    console.error("❌ Error retrieving player:", error);
    res.status(500).json({ error: "Error retrieving player" });
  }
});

module.exports = router;
