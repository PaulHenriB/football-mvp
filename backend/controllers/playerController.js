// backend/controllers/playerController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ GET /api/players → List all players
const getPlayers = async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        availability: true,
        matches: true
      }
    });
    res.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
};

// ✅ GET /api/players/available?date=YYYY-MM-DD
// Return players who marked themselves available for a given date
const getAvailablePlayers = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Match date is required (use ?date=YYYY-MM-DD)' });
    }

    const matchDate = new Date(date);

    const availabilities = await prisma.availability.findMany({
      where: { matchDate, isAvailable: true },
      include: { player: true }
    });

    const availablePlayers = availabilities.map(a => ({
      id: a.player.id,
      name: a.player.name,
      position: a.player.position,
      rating: a.player.rating,
      availability: {
        matchDate: a.matchDate,
        isAvailable: a.isAvailable
      }
    }));

    res.json(availablePlayers);
  } catch (error) {
    console.error('Error fetching available players:', error);
    res.status(500).json({ error: 'Failed to fetch available players' });
  }
};

// ✅ POST /api/players → Create a new player
const createPlayer = async (req, res) => {
  const { name, email, position, rating, userId } = req.body;

  try {
    const player = await prisma.player.create({
      data: { name, email, position, rating, userId }
    });
    res.status(201).json(player);
  } catch (error) {
    console.error('Error creating player:', error);
    res.status(500).json({ error: 'Failed to create player' });
  }
};

// ✅ PUT /api/players/:id → Update player info
const updatePlayer = async (req, res) => {
  const playerId = parseInt(req.params.id);
  const { name, email, position, rating } = req.body;

  try {
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { name, email, position, rating }
    });
    res.json(player);
  } catch (error) {
    console.error('Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player' });
  }
};

// ✅ DELETE /api/players/:id → Remove player
const deletePlayer = async (req, res) => {
  const playerId = parseInt(req.params.id);

  try {
    await prisma.player.delete({ where: { id: playerId } });
    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    console.error('Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player' });
  }
};

module.exports = {
  getPlayers,
  getAvailablePlayers,
  createPlayer,
  updatePlayer,
  deletePlayer
};
