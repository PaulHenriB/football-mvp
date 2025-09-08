// backend/controllers/availabilityController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/availability
const createAvailability = async (req, res) => {
  const { matchDate, isAvailable } = req.body;
  try {
    const player = await prisma.player.findFirst({ where: { userId: req.user.id } });
    if (!player) return res.status(400).json({ error: 'Player profile not found' });

    const availability = await prisma.availability.upsert({
      where: { playerId_matchDate: { playerId: player.id, matchDate: new Date(matchDate) } },
      update: { isAvailable },
      create: { playerId: player.id, matchDate: new Date(matchDate), isAvailable },
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({ error: 'Failed to create availability' });
  }
};

// GET /api/availability/me
const getMyAvailability = async (req, res) => {
  try {
    const player = await prisma.player.findFirst({ where: { userId: req.user.id } });
    if (!player) return res.status(400).json({ error: 'Player profile not found' });

    const availability = await prisma.availability.findMany({
      where: { playerId: player.id },
      orderBy: { matchDate: 'asc' }
    });

    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

// PUT /api/availability/:id
const updateAvailability = async (req, res) => {
  const availabilityId = parseInt(req.params.id);
  const { isAvailable } = req.body;
  try {
    const availability = await prisma.availability.update({
      where: { id: availabilityId },
      data: { isAvailable }
    });
    res.json(availability);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// DELETE /api/availability/:id
const deleteAvailability = async (req, res) => {
  const availabilityId = parseInt(req.params.id);
  try {
    await prisma.availability.delete({ where: { id: availabilityId } });
    res.json({ message: '✅ Availability removed' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
};

module.exports = {
  createAvailability,
  getMyAvailability,
  updateAvailability,
  deleteAvailability,
};
