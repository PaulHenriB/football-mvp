// backend/routes/players.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); // adjust if your prisma client path differs

const {
  getPlayers,
  getAvailablePlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require('../controllers/playerController');

// GET /api/players → list all players
router.get('/', getPlayers);

// GET /api/players/available?date=YYYY-MM-DD
router.get('/available', getAvailablePlayers);

// POST /api/players → create a new player
router.post('/', createPlayer);

// PUT /api/players/:id → update a player
router.put('/:id', updatePlayer);

// DELETE /api/players/:id → delete a player
router.delete('/:id', deletePlayer);

// NEW: GET /api/players/:id/ratings → list ratings RECEIVED + average
router.get('/:id/ratings', async (req, res) => {
  const playerId = parseInt(req.params.id, 10);
  if (!Number.isFinite(playerId)) {
    return res.status(400).json({ error: 'Invalid player id' });
  }

  try {
    // Fetch ratings this player RECEIVED
    const [ratings, agg] = await Promise.all([
      prisma.rating.findMany({
        where: { playerId }, // ratings received by this player
        orderBy: { createdAt: 'desc' },
        include: {
          match: { select: { id: true, date: true } },
        },
      }),
      prisma.rating.aggregate({
        where: { playerId },
        _avg: { score: true },
        _count: { _all: true },
      }),
    ]);

    res.json({
      message: '✅ Ratings fetched',
      average: agg._avg.score ?? null,
      count: agg._count._all,
      ratings,
    });
  } catch (err) {
    console.error('❌ Error fetching ratings:', err);
    res.status(500).json({ error: 'Error fetching ratings' });
  }
});

module.exports = router;
