const express = require("express");
const router = express.Router();
const Match = require("../models/Match"); // Sequelize model
const PlayerMatch = require("../models/PlayerMatch"); // Junction table (if exists)
const Rating = require("../models/Rating"); // For ratings

// ==========================
// GET /matches/open → all upcoming matches
// ==========================
router.get("/open", async (req, res) => {
  try {
    const matches = await Match.findAll({
      where: {
        dateTime: { [require("sequelize").Op.gte]: new Date() }
      },
      order: [["dateTime", "ASC"]],
      include: ["players"] // if you defined associations
    });

    res.json({
      message: "✅ Open matches fetched successfully",
      matches
    });
  } catch (error) {
    console.error("❌ Error fetching matches:", error);
    res.status(500).json({ error: "Error fetching matches" });
  }
});

// ==========================
// POST /matches/create → create a match
// ==========================
router.post("/create", async (req, res) => {
  try {
    const { matchType, dateTime, location, duration, maxPlayers, visibility, notes } = req.body;

    if (!matchType || !dateTime || !location || !duration || !maxPlayers || !visibility) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const match = await Match.create({
      matchType,
      dateTime,
      location,
      duration,
      maxPlayers,
      visibility,
      notes
    });

    res.status(201).json({
      message: "✅ Match created successfully",
      match
    });
  } catch (error) {
    console.error("❌ Error creating match:", error);
    res.status(500).json({ error: "Error creating match" });
  }
});

// ==========================
// POST /matches/:id/join → join a match
// ==========================
router.post("/:id/join", async (req, res) => {
  try {
    const { playerId } = req.body;
    const matchId = req.params.id;

    if (!playerId) return res.status(400).json({ error: "Player ID is required" });

    // Add player to match (assumes junction table PlayerMatch exists)
    await PlayerMatch.create({ matchId, playerId });

    res.json({ message: "✅ Player joined match successfully" });
  } catch (error) {
    console.error("❌ Error joining match:", error);
    res.status(500).json({ error: "Error joining match" });
  }
});

// ==========================
// POST /matches/:id/rate → rate a match/player
// ==========================
router.post("/:id/rate", async (req, res) => {
  try {
    const { playerId, score } = req.body;
    const matchId = req.params.id;

    if (!playerId || !score) {
      return res.status(400).json({ error: "Player ID and score are required" });
    }

    const rating = await Rating.create({
      matchId,
      playerId,
      score
    });

    res.json({
      message: "✅ Rating submitted successfully",
      rating
    });
  } catch (error) {
    console.error("❌ Error rating match:", error);
    res.status(500).json({ error: "Error rating match" });
  }
});

module.exports = router;
