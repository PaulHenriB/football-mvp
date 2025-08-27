// backend/controllers/matchController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { balanceTeams } = require('../utils/teamBalancer');

// GET /api/matches
const getMatches = async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: { players: { include: { player: true } } }
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
        createdBy: req.user.id
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

// POST /api/matches/:id/rate
const ratePlayer = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { playerId, score, comment } = req.body;

  try {
    const rating = await prisma.rating.create({
      data: { playerId, matchId, score, comment }
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error('Error rating player:', error);
    res.status(500).json({ error: 'Failed to rate player' });
  }
};

// POST /api/matches/:id/availability
const setAvailability = async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { isAvailable } = req.body;
  const playerId = req.user.id; // assumes player is tied to user

  try {
    const availability = await prisma.availability.upsert({
      where: {
        playerId_matchDate: {
          playerId,
          matchDate: new Date(req.body.matchDate)
        }
      },
      update: { isAvailable },
      create: {
        playerId,
        matchDate: new Date(req.body.matchDate),
        isAvailable
      }
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
  getMatchPlayers,
  ratePlayer,
  setAvailability,
  getBalancedTeams
};
