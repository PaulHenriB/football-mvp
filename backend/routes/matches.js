// backend/routes/matches.js 
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const { authenticate } = require('../utils/authMiddleware'); // JWT middleware

// import controller methods
const {
  getMatches,
  createMatch,
  updateMatch,
  getMatchPlayers,
  ratePlayer,
  getBalancedTeams,
  finishMatch,      // new
  getPlayerRatings, // new
  saveTeams,        // ✅ NEW
} = require('../controllers/matchController');

// ---------------- ROUTES ---------------- //

// GET all matches
router.get('/', getMatches);

// POST create new match (authenticated)
router.post('/', authenticate, createMatch);

// PUT update match info (authenticated)
router.put('/:id', authenticate, updateMatch);

// GET players for a match
router.get('/:id/players', getMatchPlayers);

// ---------------- PLAYER AVAILABILITY (MATCH-SPECIFIC) ---------------- //
// POST /api/matches/:id/availability → set availability for a match
router.post('/:id/availability', authenticate, async (req, res) => {
  try {
    const matchId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!matchId || !status) {
      return res.status(400).json({ error: 'Match ID and status are required' });
    }

    const isAvailable = status === 'available';

    // Check match exists
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Upsert player availability for this match
    const existing = await prisma.availability.findFirst({
      where: { playerId: req.user.id, matchDate: match.date },
    });

    let record;
    if (existing) {
      record = await prisma.availability.update({
        where: { id: existing.id },
        data: { isAvailable },
      });
    } else {
      record = await prisma.availability.create({
        data: { playerId: req.user.id, matchDate: match.date, isAvailable },
      });
    }

    res.json(record);
  } catch (err) {
    console.error('❌ Error setting match availability:', err);
    res.status(500).json({ error: 'Error setting match availability' });
  }
});

// GET balanced teams for a match
router.get('/:id/teams', getBalancedTeams);

// POST rate a player (authenticated)
router.post('/:id/rate', authenticate, ratePlayer);

// PUT set final result (only managers, authenticated)
router.put('/:id/result', authenticate, finishMatch);

// ✅ NEW: POST save teams (only managers, authenticated)
router.post('/:id/save-teams', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Only managers can save teams' });
    }
    return saveTeams(req, res, next);
  } catch (err) {
    console.error('❌ Error saving teams:', err);
    res.status(500).json({ error: 'Error saving teams' });
  }
});

// GET ratings + average for a player
router.get('/players/:id/ratings', getPlayerRatings);

module.exports = router;
