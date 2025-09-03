// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../utils/authMiddleware'); // needs JWT on requests

const prisma = new PrismaClient();

/** helper: shape match response with counts & open/closed */
function shapeMatch(m) {
  const registered = m._count?.players ?? (m.players?.length || 0);
  const isOpen = typeof m.capacity === 'number' ? registered < m.capacity : true;

  return {
    id: m.id,
    date: m.date,
    location: m.location,
    duration: m.duration,
    fee: m.fee,
    capacity: m.capacity,
    registered,
    status: isOpen ? 'open' : 'closed',
  };
}

/**
 * GET /matches
 * - Optional filter: ?status=open
 * - For MVP we compute "open" as playersCount < capacity
 */
router.get('/', async (req, res) => {
  const { status } = req.query;

  try {
    // For efficiency: fetch matches with a players _count
    const matches = await prisma.match.findMany({
      orderBy: { date: 'asc' },
      include: { _count: { select: { players: true } } },
    });

    let filtered = matches;

    if (status === 'open') {
      filtered = matches.filter(m => {
        const cnt = m._count.players;
        return typeof m.capacity === 'number' ? cnt < m.capacity : true;
      });
    }

    res.json({
      message: '✅ Matches fetched',
      matches: filtered.map(shapeMatch),
    });
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    res.status(500).json({ error: 'Error fetching matches' });
  }
});

/**
 * POST /matches/:id/join
 * - Requires auth (JWT)
 * - Finds the Player linked to the logged-in User, validates capacity/duplicates, and joins
 * - Uses a transaction to avoid race conditions
 */
router.post('/:id/join', authenticate, async (req, res) => {
  const matchId = parseInt(req.params.id, 10);
  const userId = req.user?.id; // from JWT

  if (!Number.isFinite(matchId)) {
    return res.status(400).json({ error: 'Invalid match id' });
  }

  try {
    // 1) Find the Player profile for this user
    const player = await prisma.player.findFirst({
      where: { userId: userId },
      select: { id: true },
    });

    if (!player) {
      return res.status(400).json({
        error: 'No Player profile linked to your account. Create your player profile first.',
      });
    }

    // 2) Transaction: re-check capacity & duplicates, then join
    const result = await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { _count: { select: { players: true } } },
      });

      if (!match) {
        return { ok: false, status: 404, error: 'Match not found' };
      }

      // already joined?
      const already = await tx.playerMatch.findUnique({
        where: { playerId_matchId: { playerId: player.id, matchId } },
      });
      if (already) {
        return { ok: false, status: 400, error: 'You are already registered for this match' };
      }

      // capacity check
      const currentCount = match._count.players;
      const capacity = match.capacity ?? Infinity;

      if (currentCount >= capacity) {
        return { ok: false, status: 400, error: 'Match is already full' };
      }

      // join
      await tx.playerMatch.create({
        data: {
          playerId: player.id,
          matchId: matchId,
          team: 'UNASSIGNED', // or null if you prefer
        },
      });

      // re-count after join (to report final status)
      const after = await tx.match.findUnique({
        where: { id: matchId },
        include: { _count: { select: { players: true } } },
      });

      return {
        ok: true,
        match: {
          ...after,
          capacity,
        },
      };
    });

    if (!result.ok) {
      return res.status(result.status).json({ error: result.error });
    }

    const shaped = shapeMatch(result.match);
    const becameFull = shaped.registered >= shaped.capacity;

    res.json({
      message: becameFull
        ? '✅ Joined. Match is now full and considered closed.'
        : '✅ Joined match successfully',
      match: shaped,
    });
  } catch (error) {
    console.error('❌ Error joining match:', error);
    // unique constraint case (duplicate join in a race)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You are already registered for this match' });
    }
    res.status(500).json({ error: 'Error joining match' });
  }
});

module.exports = router;
