const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Register a new player
router.post('/register', async (req, res) => {
  const { name, email, position } = req.body;

  if (!name || !email || !position) {
    return res.status(400).json({ error: 'Missing name, email, or position' });
  }

  try {
    const existingPlayer = await prisma.player.findUnique({ where: { email } });

    if (existingPlayer) {
      return res.status(200).json({
        message: 'Player already exists',
        player: existingPlayer,
      });
    }

    const newPlayer = await prisma.player.create({
      data: {
        name,
        email,
        position,
      },
    });

    res.status(201).json({
      message: '✅ Player registered successfully',
      player: newPlayer,
    });
  } catch (error) {
    console.error('❌ Error registering player:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const player = await prisma.player.findUnique({
      where: { id: parseInt(id) },
      include: {
        availability: true,
        matches: {
          include: {
            match: true,
          },
        },
      },
    });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ player });
  } catch (error) {
    console.error('❌ Error fetching player:', error);
    res.status(500).json({ error: 'Failed to retrieve player', details: error.message });
  }
});

module.exports = router;
