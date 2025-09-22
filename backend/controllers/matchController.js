// backend/controllers/matchController.js 
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();
const { balanceTeams } = require('../utils/teamBalancer');

// ---------------- MATCH CRUD ----------------

// GET /api/matches
const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: { players: { include: { player: true } }, teams: true, ratings: true },
    });
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
};

// POST /api/matches
const createMatch = async (req, res) => {
  const { date, location, duration, fee } = req.body;

  try {
    const match = await prisma.match.create({
      data: {
        date: new Date(date),
        location,
        duration,
        fee,
        createdBy: req.user.id,
      },
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
      data: { date: new Date(date), location, duration, fee },
    });
    res.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
};

// GET /api/matches/:id/players
const getMatchPlayers = async (req, res) => {
  const matchId = parseInt(req.params.id);

  try {
    const players = await prisma.playerMatch.findMany({
      where: { matchId },
      include: { player: true },
    });
    res.json(players);
  } catch (error) {
    console.error('Error fetching match players:', error);
    res.status(500).json({ error: 'Failed to fetch match players' });
  }
};

// ---------------- MATCH RESULT ----------------

// PUT /api/matches/:id/result
const finishMatch = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { homeScore, awayScore } = req.body;

  try {
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

    res.json({ message: '✅ Match finished', match: updated });
  } catch (error) {
    console.error('Error finishing match:', error);
    res.status(500).json({ error: 'Failed to finish match' });
  }
};

// ---------------- RATINGS ----------------

// POST /api/matches/:id/rate
const ratePlayer = async (req, res) => {
  const matchId = parseInt(req.params.id);
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

    // enforce opponent-only rule
    if (raterPM.team === targetPM.team) {
      return res.status(400).json({ error: 'You can only rate opponents' });
    }

    // create rating
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
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You already rated this opponent in this match' });
    }
    console.error('Error rating player:', error);
    res.status(500).json({ error: 'Failed to rate player' });
  }
};

// GET /api/players/:id/ratings
const getPlayerRatings = async (req, res) => {
  const playerId = parseInt(req.params.id);

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
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};

// ---------------- TEAMS ----------------

// GET /api/matches/:id/teams
const getBalancedTeams = async (req, res) => {
  const matchId = parseInt(req.params.id);

  try {
    const playerMatches = await prisma.playerMatch.findMany({
      where: { matchId },
      include: { player: true },
    });

    if (!playerMatches || playerMatches.length < 2) {
      return res.status(400).json({ message: 'Not enough players to form teams.' });
    }

    const players = playerMatches.map(pm => ({
      id: pm.player.id,
      name: pm.player.name,
      rating: pm.player.rating,
      position: pm.player.position,
    }));

    const { teamA, teamB } = balanceTeams(players);

    res.json({ teamA, teamB });
  } catch (err) {
    console.error('Error generating teams:', err);
    res.status(500).json({ message: 'Failed to generate teams.' });
  }
};

// POST /api/matches/:id/save-teams
const saveTeams = async (req, res) => {
  const matchId = parseInt(req.params.id, 10);
  const { team1, team2 } = req.body;

  try {
    if (!matchId || !team1 || !team2) {
      return res.status(400).json({ error: 'Match ID, team1, and team2 are required' });
    }

    // Ensure match exists
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Remove any existing team assignments for this match
    await prisma.playerMatch.deleteMany({ where: { matchId } });

    // Insert team1 assignments
    const team1Data = team1.map(player => ({
      matchId,
      playerId: player.id,
      team: 'TEAM1',
    }));

    // Insert team2 assignments
    const team2Data = team2.map(player => ({
      matchId,
      playerId: player.id,
      team: 'TEAM2',
    }));

    await prisma.playerMatch.createMany({
      data: [...team1Data, ...team2Data],
    });

    res.json({ success: true, message: '✅ Teams saved successfully' });
  } catch (err) {
    console.error('❌ Error saving teams:', err);
    res.status(500).json({ error: 'Error saving teams' });
  }
};

// ---------------- EXPORTS ----------------

module.exports = {
  getMatches,
  createMatch,
  updateMatch,
  getMatchPlayers,
  finishMatch,
  ratePlayer,
  getPlayerRatings,
  getBalancedTeams,
  saveTeams, // ✅ new export
};

