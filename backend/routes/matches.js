const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to ensure user is authenticated
function isAuthenticated(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized access' });
  }
  next();
}

// GET: Fetch all matches (public list or admin view)
router.get('/', async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { dateTime: 'asc' },
    });

    res.json({
      message: '✅ Matches fetched successfully',
      matches,
    });
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    res.status(500).json({
      error: 'Error fetching matches',
      details: error.message,
    });
  }
});

// POST: Create match with referee assignment
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const {
      matchType,
      dateTime,
      location,
      duration,
      maxPlayers,
      visibility,
      notes,
      refereeId, // 👈 New
    } = req.body;

    if (!matchType || !dateTime || !location || !duration || !maxPlayers || !visibility) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const match = await prisma.match.create({
      data: {
        matchType,
        dateTime: new Date(dateTime),
        location,
        duration,
        maxPlayers,
        visibility,
        notes,
        refereeId: refereeId || null, // 👈 Optional
      },
    });

    res.status(201).json({
      message: '✅ Match created successfully',
      match,
    });
  } catch (error) {
    console.error('❌ Error creating match:', error);
    res.status(500).json({
      error: 'Error creating match',
      details: error.message,
    });
  }
});

// GET: Referee fetch their assigned match
router.get('/referee/my-match', isAuthenticated, async (req, res) => {
  try {
    const refereeId = req.session.userId;

    const match = await prisma.match.findFirst({
      where: {
        refereeId: refereeId,
        dateTime: {
          gte: new Date(new Date().setDate(new Date().getDate() - 1)) // Optional: match must be recent
        }
      },
      include: {
        players: true,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'No assigned match found for this referee' });
    }

    res.json({
      message: '✅ Referee match fetched',
      match,
    });
  } catch (error) {
    console.error('❌ Error fetching referee match:', error);
    res.status(500).json({ error: 'Error fetching referee match', details: error.message });
  }
});

// POST: Submit match result (only by assigned referee)
router.post('/:matchId/submit-result', isAuthenticated, async (req, res) => {
  try {
    const { matchId } = req.params;
    const refereeId = req.session.userId;
    const { finalScoreA, finalScoreB } = req.body;

    const match = await prisma.match.findUnique({
      where: { id: Number(matchId) },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.refereeId !== refereeId) {
      return res.status(403).json({ error: 'You are not authorized to submit this match result' });
    }

    const updatedMatch = await prisma.match.update({
      where: { id: Number(matchId) },
      data: {
        finalScoreA,
        finalScoreB,
        resultSubmitted: true,
      },
    });

    res.json({
      message: '✅ Match result submitted',
      match: updatedMatch,
    });
  } catch (error) {
    console.error('❌ Error submitting match result:', error);
    res.status(500).json({ error: 'Error submitting result', details: error.message });
  }
});

module.exports = router;
