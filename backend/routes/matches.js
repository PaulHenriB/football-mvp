// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const teamBalancer = require('../utils/teamBalancer'); // your existing balancer

const prisma = new PrismaClient();

/**
 * Strict rating-balanced algorithm
 */
function ratingBalanced(players) {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);

  let teamA = [];
  let teamB = [];
  let totalA = 0;
  let totalB = 0;

  for (let p of sorted) {
    if (totalA <= totalB) {
      teamA.push(p);
      totalA += p.rating;
    } else {
      teamB.push(p);
      totalB += p.rating;
    }
  }

  return {
    teamA,
    teamB,
    avgA: teamA.length ? totalA / teamA.length : 0,
    avgB: teamB.length ? totalB / teamB.length : 0,
  };
}

/**
 * Create a match
 */
router.post('/', async (req, res) => {
  try {
    const { city, date } = req.body;

    const match = await prisma.match.create({
      data: {
        city,
        date: new Date(date),
      },
    });

    res.json({ message: '✅ Match created successfully', match });
  } catch (error) {
    console.error('❌ Error creating match:', error);
    res.status(500).json({ error: 'Error creating match', details: error.message });
  }
});

/**
 * Assign players to a match
 */
router.post('/:matchId/players', async (req, res) => {
  const { matchId } = req.params;
  const { playerIds } = req.body; // Expecting [1, 2, 3...]

  try {
    // Validate match exists
    const match = await prisma.match.findUnique({ where: { id: parseInt(matchId) } });
    if (!match) return res.status(404).json({ error: 'Match not found' });

    // Connect players to match via PlayerMatch
    const updatedMatch = await prisma.match.update({
      where: { id: parseInt(matchId) },
      data: {
        players: {
          create: playerIds.map((id) => ({
            player: { connect: { id } },
          })),
        },
      },
      include: {
        players: {
          include: { player: true },
        },
      },
    });

    res.json({ message: '✅ Players assigned successfully', match: updatedMatch });
  } catch (error) {
    console.error('❌ Error assigning players:', error);
    res.status(500).json({ error: 'Error assigning players', details: error.message });
  }
});

/**
 * Balance teams
 */
router.post('/:matchId/balance', async (req, res) => {
  const { matchId } = req.params;
  const { mode } = req.query; // pass ?mode=ratingBalanced for strict mode

  try {
    const match = await prisma.match.findUnique({
      where: { id: parseInt(matchId) },
      include: {
        players: {
          include: { player: true },
        },
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Extract actual Player objects
    const actualPlayers = match.players.map((pm) => pm.player);

    let result;
    if (mode === 'ratingBalanced') {
      result = ratingBalanced(actualPlayers);
    } else {
      result = teamBalancer(actualPlayers);
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
