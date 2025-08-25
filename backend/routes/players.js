const express = require('express');
const router = express.Router();
const { PrismaClient, Position } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all players
router.get('/', async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      include: {
        availability: true,
        matches: {
          include: {
            match: true,
          },
        },
      },
    });

    res.json({
      message: '✅ Players retrieved successfully',
      players,
    });
  } catch (error) {
    console.error('❌ Error retrieving players:', error);
    res.status(500).json({ error: 'Failed to get players', details: error.message });
  }
});

// Update player info
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, position, rating } = req.body;

  try {
    const updatedPlayer = await prisma.player.update({
      where: { id: parseInt(id) },
      data: {
        name,
        position,
        rating,
      },
    });

    res.json({
      message: '✅ Player updated successfully',
      player: updatedPlayer,
    });
  } catch (error) {
    console.error('❌ Error updating player:', error);
    res.status(500).json({ error: 'Failed to update player', details: error.message });
  }
});

// Delete player
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.player.delete({ where: { id: parseInt(id) } });
    res.json({ message: '✅ Player deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting player:', error);
    res.status(500).json({ error: 'Failed to delete player', details: error.message });
  }
});

module.exports = router;
