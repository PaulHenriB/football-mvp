// backend/controllers/matchController.js
const { PrismaClient, MatchStatus } = require('@prisma/client');
const prisma = new PrismaClient();
const { balanceTeams } = require('../utils/teamBalancer');

// GET /api/matches
const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: { players: { include: { player: true } }, teams: true, ratings: true }
    });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

// POST /api/matches
const createMatch = async (req, res) => {
  const { date, location, duration, fee, capacity } = req.body;

  try {
    const match = await prisma.match.create({
      data: {
        date: new Date(date),
        location,
        duration,
        fee,
        createdBy: req.user.id,
        capacity,
        status: 'SCHEDULED',
      }
    });
    res.status(201).json(match);
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: 'Failed to create match' });
  }
};

// PUT /api/matches/:id
const updateMatch = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { date, location, duration, fee } = req.body;

  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { date: new Date(date), location, duration, fee }
    });
    res.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
};

// ✅ NEW: PUT /api/matches/:id/result
const setMatchResult = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { homeScore, awayScore } = req.body;

  try {
    // TODO: replace this with real role check
    if (!req.user || !req.user.isManager) {
      return res.status(403).json({ error: 'Only managers can set match results' });
    }

    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        status: 'FINISHED',
      },
    });

    res.json({ message: '✅ Match result saved', match });
  } catch (error) {
    console.error('Error finishing match:', error);
    res.status(500).json({ error: 'Failed to set match result' });
  }
};

// GET /api/matches/:id/players
const getMatchPlayers = async (req, res) => {
  const matchId = parseInt(req.params.id);

  try {
    const players = await prisma.playerMatch.findMany({
      where: { matchId },
      include: { player: true }
    });
    res.json(players);
  } catch (error) {
    console.error('Error fetching match players:', error);
    res.status(500).json({ error: 'Failed to fetch match players' });
  }
};

// ✅ UPDATED: POST /api/matches/:id/rate
const ratePlayer = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const raterUserId = req.user?.id;
  const { playerId, score, comment } = req.body;

  try {
    // 1) Ensure match is finished
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.status !== 'FINISHED') {
      return res.status(400).json({ error: 'You can only rate after the match is finished' });
    }

    // 2) Get the rater's Player profile
    const raterPlayer = await prisma.player.findFirst({ where: { userId: raterUserId } });
    if (!raterPlayer) {
      return res.status(400).json({ error: 'You must have a Player profile to rate' });
    }

    // 3) Prevent self-rating
    if (raterPlayer.id === playerId) {
      return res.status(400).json({ error: 'You cannot rate yourself' });
    }

    // 4) Check both players were in the match
    const raterPlayed = await prisma.playerMatch.findUnique({
      where: { playerId_matchId: { playerId: raterPlayer.id, matchId } }
    });
    const targetPlayed = await prisma.playerMatch.findUnique({
      where: { playerId_matchId: { playerId, matchId } }
    });
    if (!raterPlayed || !targetPlayed) {
      return res.status(400).json({ error: 'Both players must have participated in the match' });
    }

    // 5) Optional: ensure rating opponents only (different teams)
    if (raterPlayed.team && targetPlayed.team && raterPlayed.team === targetPlayed.team) {
      return res.status(400).json({ error: 'You can only rate opponents, not your teammates' });
    }

    // 6) Prevent duplicate rating
    const existing = await prisma.rating.findUnique({
      where: { playerId_matchId: { playerId, matchId } }
    });
    if (existing) {
      return res.status(400).json({ error: 'You have already rated this player for this match' });
    }

    // 7) Save rating
    const rating = await prisma.rating.create({
      data: { playerId, matchId, score, comment }
    });

    res.status(201).json({ message: '✅ Rating saved', rating });
  } catch (error) {
    console.error('Error rating player:', error);
    res.status(500).json({ error: 'Failed to rate player' });
  }
};

// POST /api/matches/:id/availability
const setAvailability = async (req, res) => {
  const { matchDate, isAvailable, playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: 'playerId is required' });

  try {
    const availability = await prisma.availability.upsert({
      where: { playerId_matchDate: { playerId, matchDate: new Date(matchDate) } },
      update: { isAvailable },
      create: { playerId, matchDate: new Date(matchDate), isAvailable }
    });
    res.json(availability);
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

// GET /api/matches/:id/teams
const getBalancedTeams = async (req, res) => {
  const matchId = parseInt(req.params.id);

  try {
    const playerMatches = await prisma.playerMatch.findMany({
      where: { matchId },
      include: { player: true }
    });

    if (!playerMatches || playerMatches.length < 2) {
      return res.status(400).json({ message: 'Not enough players to form teams.' });
    }

    const players = playerMatches.map(pm => ({
      id: pm.player.id,
      name: pm.player.name,
      rating: pm.player.rating,
      position: pm.player.position
    }));

    const { teamA, teamB } = balanceTeams(players);

    res.json({ teamA, teamB });
  } catch (err) {
    console.error('Error generating teams:', err);
    res.status(500).json({ message: 'Failed to generate teams.' });
  }
};

module.exports = { 
  getMatches, 
  createMatch, 
  updateMatch, 
  setMatchResult,   // ✅ NEW
  getMatchPlayers, 
  ratePlayer,       // ✅ UPDATED
  setAvailability, 
  getBalancedTeams 
};
