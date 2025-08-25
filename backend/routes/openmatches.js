const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 🔍 Search for open matches by city and date
router.get('/search', async (req, res) => {
  const { date, city } = req.query;

  try {
    const matchDate = date ? new Date(date) : new Date();

    const matches = await prisma.match.findMany({
      where: {
        date: {
          gte: matchDate,
        },
        ...(city && {
          location: {
            contains: city,
            mode: 'insensitive',
          },
        }),
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        players: {
          include: {
            player: true,
          },
        },
      },
    });

    res.json({
      message: '✅ Matches retrieved',
      matches,
    });
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    res.status(500).json({
      error: 'Failed to fetch matches',
      details: error.message,
    });
  }
});

// 📝 Apply player to a match
router.post('/:matchId/apply', async (req, res) => {
  const { matchId } = req.params;
  const { playerId, team } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'Missing playerId in request body' });
  }

  try {
    // Check for duplicate application
    const existing = await prisma.playerMatch.findFirst({
      where: {
        matchId: parseInt(matchId),
        playerId: parseInt(playerId),
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Player already registered for this match' });
    }

    const participation = await prisma.playerMatch.create({
      data: {
        matchId: parseInt(matchId),
        playerId: parseInt(playerId),
        team: team || 'TBD', // optional fallback
      },
    });

    res.status(201).json({
      message: '✅ Player successfully registered for match',
      participation,
    });
  } catch (error) {
    console.error('❌ Error applying to match:', error);
    res.status(500).json({
      error: 'Failed to apply to match',
      details: error.message,
    });
  }
});

module.exports = router;
