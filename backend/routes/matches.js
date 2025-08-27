// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const teamBalancer = require('../utils/teamBalancer'); // your existing balancer

const prisma = new PrismaClient();

// Strict rating-balanced algorithm
function ratingBalanced(players) {
  // Sort players by rating (highest first)
  const sorted = [...players].sort((a, b) => b.rating - a.rating);

  let teamA = [];
  let teamB = [];
  let totalA = 0;
  let totalB = 0;

  // Greedy assign: always put next best player in weaker team
  for (let p of sorted) {
    if (totalA <= totalB) {
      teamA.push(p);
      totalA += p.rating;
    } else {
      teamB.push(p);
      totalB += p.rating;
    }
  }

  return { teamA, teamB, avgA: totalA / teamA.length, avgB: totalB / teamB.length };
}

// Example route using both algorithms
router.post('/:matchId/balance', async (req, res) => {
  const { matchId } = req.params;
  const { mode } = req.query; // pass ?mode=ratingBalanced for strict mode

  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { players: true },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    let result;
    if (mode === 'ratingBalanced') {
      result = ratingBalanced(match.players);
    } else {
      result = teamBalancer(match.players); // your existing balancer
    }

    res.json({
      message: `✅ Teams balanced using ${mode || 'default'} algorithm`,
      result,
    });
  } catch (error) {
    console.error('❌ Error balancing teams:', error);
    res.status(500).json({ error: 'Error balancing teams', details: error.message });
  }
});

module.exports = router;
