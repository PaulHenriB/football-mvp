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

// --- PLAYER AVAILABILITY ROUTES --- //
const { authenticate } = require('../utils/authMiddleware');

// GET /api/players/me/availability → fetch logged-in player’s availability
router.get('/me/availability', authenticate, async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { playerId: req.user.id };

    if (from || to) {
      where.matchDate = {};
      if (from) where.matchDate.gte = new Date(from);
      if (to) where.matchDate.lte = new Date(to);
    }

    const availability = await prisma.availability.findMany({
      where,
      orderBy: { matchDate: 'asc' },
    });

    res.json(availability);
  } catch (err) {
    console.error('❌ Error fetching availability:', err);
    res.status(500).json({ error: 'Error fetching availability' });
  }
});

// POST /api/players/me/availability → create or update by date
router.post('/me/availability', authenticate, async (req, res) => {
  try {
    const { date, status } = req.body;
    if (!date || !status) {
      return res.status(400).json({ error: 'Date and status are required' });
    }

    const matchDate = new Date(date);
    const isAvailable = status === 'available';

    const existing = await prisma.availability.findFirst({
      where: { playerId: req.user.id, matchDate },
    });

    let record;
    if (existing) {
      record = await prisma.availability.update({
        where: { id: existing.id },
        data: { isAvailable },
      });
    } else {
      record = await prisma.availability.create({
        data: { playerId: req.user.id, matchDate, isAvailable },
      });
    }

    res.json(record);
  } catch (err) {
    console.error('❌ Error creating/updating availability:', err);
    res.status(500).json({ error: 'Error saving availability' });
  }
});

// PUT /api/players/me/availability/:id → update by ID
router.put('/me/availability/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, status } = req.body;

    const existing = await prisma.availability.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existing || existing.playerId !== req.user.id) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    const updated = await prisma.availability.update({
      where: { id: existing.id },
      data: {
        matchDate: date ? new Date(date) : existing.matchDate,
        isAvailable: status ? status === 'available' : existing.isAvailable,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating availability:', err);
    res.status(500).json({ error: 'Error updating availability' });
  }
});

// DELETE /api/players/me/availability/:id → delete by ID
router.delete('/me/availability/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.availability.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existing || existing.playerId !== req.user.id) {
      return res.status(404).json({ error: 'Availability not found' });
    }

    await prisma.availability.delete({
      where: { id: existing.id },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error deleting availability:', err);
    res.status(500).json({ error: 'Error deleting availability' });
  }
});


module.exports = router;
