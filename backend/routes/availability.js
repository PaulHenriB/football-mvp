// backend/routes/availability.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware: ensure user is logged in
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// ---------------- CREATE ----------------
// POST /api/availability
router.post('/', requireAuth, async (req, res) => {
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
});

// ---------------- READ ----------------
// GET /api/availability/me
router.get('/me', requireAuth, async (req, res) => {
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
});

// ---------------- UPDATE ----------------
// PUT /api/availability/:id
router.put('/:id', requireAuth, async (req, res) => {
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
});

// ---------------- DELETE ----------------
// DELETE /api/availability/:id
router.delete('/:id', requireAuth, async (req, res) => {
  const availabilityId = parseInt(req.params.id);

  try {
    await prisma.availability.delete({ where: { id: availabilityId } });
    res.json({ message: '✅ Availability removed' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: 'Failed to delete availability' });
  }
});

module.exports = router;
