// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../utils/authMiddleware'); // requires JWT
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
    status: m.status || (isOpen ? 'open' : 'closed'),
    homeScore: m.homeScore ?? null,
    awayScore: m.awayScore ?? null,
  };
}

/**
 * GET /matches
 * - Optional filter: ?status=open
 */
router.get('/', async (req, res) => {
  const { status } = req.query;
  try {
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
 * - Requires auth
 */
router.post('/:id/join', authenticate, async (req, res) => {
  const matchId = parseInt(req.params.id, 10);
  const userId = req.user?.id;
  if (!Number.isFinite(matchId)) {
    return res.status(400).json({ error: 'Invalid match id' });
  }

  try {
    const player = await prisma.player.findFirst({
      where: { userId },
      select: { id: true },
    });
    if (!player) {
      return res.status(400).json({ error: 'No Player profile linked to your account' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        include: { _count: { select: { players: true } } },
      });
      if (!match) return { ok: false, status: 404, error: 'Match not found' };

      const already = await tx.playerMatch.findUnique({
        where: { playerId_matchId: { playerId: player.id, matchId } },
      });
      if (already) return { ok: false, status: 400, error: 'Already registered' };

      if ((match._count.players ?? 0) >= (match.capacity ?? Infinity)) {
        return { ok: false, status: 400, error: 'Match is full' };
      }

      await tx.playerMatch.create({
        data: { playerId: player.id, matchId, team: 'UNASSIGNED' },
      });

      const after = await tx.match.findUnique({
        where: { id: matchId },
        include: { _count: { select: { players: true } } },
      });
      return { ok: true, match: { ...after, capacity: match.capacity } };
    });

    if (!result.ok) return res.status(result.status).json({ error: result.error });

    const shaped = shapeMatch(result.match);
    res.json({
      message: shaped.registered >= shaped.capacity
        ? '✅ Joined. Match is now full and considered closed.'
        : '✅ Joined match successfully',
      match: shaped,
    });
  } catch (error) {
    console.error('❌ Error joining match:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already registered' });
    }
    res.status(500).json({ error: 'Error joining match' });
  }
});

/**
 * PUT /matches/:id/result
 * - Manager marks match as finished (with scores)
 */
router.put('/:id/result', authenticate, async (req, res) => {
  const matchId = parseInt(req.params.id, 10);
  const { homeScore, awayScore } = req.body;

  try {
    // check role
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'Only managers can finish matches' });
    }

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        status: 'FINISHED',
      },
    });

    res.json({ message: '✅ Match finished', match: shapeMatch(updated) });
  } catch (error) {
    console.error('❌ Error finishing match:', error);
    res.status(500).json({ error: 'Error finishing match' });
  }
});

/**
 * POST /matches/:id/rate
 * - Players rate opponents after match is finished
 */
router.post('/:id/rate', authenticate, async (req, res) => {
  const matchId = parseInt(req.params.id, 10);
  const { targetPlayerId, score, comment } = req.body;

  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (match.status !== 'FINISHED') {
      return res.status(400).json({ error: 'Match is not finished yet' });
    }

    const rater = await prisma.player.findFirst({ where: { userId: req.user.id } });
    if (!rater) return res.status(400).json({ error: 'No Player profile linked to your account' });

    if (rater.id === targetPlayerId) {
      return res.status(400).json({ error: 'You cannot rate yourself' });
    }

    // check both players participated
    const [raterPM, targetPM] = await Promise.all([
      prisma.playerMatch.findUnique({
        where: { playerId_matchId: { playerId: rater.id, matchId } },
      }),
      prisma.playerMatch.findUnique({
        where: { playerId_matchId: { playerId: targetPlayerId, matchId } },
      }),
    ]);
    if (!raterPM || !targetPM) {
      return res.status(400).json({ error: 'Both players must have played in this match' });
    }

    // TODO: if you want to enforce "opponent only" -> check team values
    // if (raterPM.team === targetPM.team) return res.status(400).json({ error: 'Can only rate opponents' });

    const rating = await prisma.rating.create({
      data: {
        playerId: targetPlayerId,
        matchId,
        score,
        comment,
      },
    });

    res.json({ message: '✅ Rating submitted', rating });
  } catch (error) {
    console.error('❌ Error rating player:', error);
    res.status(500).json({ error: 'Error rating player' });
  }
});

/**
 * GET /players/:id/ratings
 * - Fetch ratings + average
 */
router.get('/players/:id/ratings', async (req, res) => {
  const playerId = parseInt(req.params.id, 10);
  try {
    const ratings = await prisma.rating.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });
    const avg = ratings.length
      ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length
      : null;
    res.json({ playerId, average: avg, ratings });
  } catch (error) {
    console.error('❌ Error fetching ratings:', error);
    res.status(500).json({ error: 'Error fetching ratings' });
  }
});

module.exports = router;
