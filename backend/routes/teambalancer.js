const express = require("express");
const router = express.Router();
const { balanceTeams } = require("../utils/teamBalancer");
const { authenticate, authorizeRole } = require("../utils/authMiddleware");

// POST /api/team-balance
router.post(
  "/",
  authenticate,
  authorizeRole(["MANAGER"]), // only managers
  async (req, res) => {
    try {
      const { players } = req.body;

      if (!players || !Array.isArray(players) || players.length === 0) {
        return res.status(400).json({ error: "No players provided" });
      }

      const result = balanceTeams(players);

      res.json(result);
    } catch (err) {
      console.error("❌ Team balancing failed:", err.message);
      res.status(500).json({ error: "Failed to balance teams" });
    }
  }
);

module.exports = router;
