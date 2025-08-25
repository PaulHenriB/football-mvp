const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

// Create a new group
router.post('/create', async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inviteCode = uuidv4();

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        createdBy: createdBy.trim(),
        inviteCode,
        members: {
          connect: { id: createdBy.trim() },
        },
      },
    });

    res.status(201).json({
      message: 'Group created successfully',
      group,
    });
  } catch (error) {
    console.error('❌ Error creating group:', error);
    res.status(500).json({
      error: 'Error creating group',
      details: error.message,
    });
  }
});

// Join a group using invite code
router.post('/join', async (req, res) => {
  try {
    const { inviteCode, userId } = req.body;

    if (!inviteCode || !userId) {
      return res.status(400).json({ error: 'Missing invite code or user ID' });
    }

    const group = await prisma.group.findUnique({
      where: { inviteCode },
      include: { members: true },
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(member => member.id === userId);

    if (!isMember) {
      await prisma.group.update({
        where: { id: group.id },
        data: {
          members: {
            connect: { id: userId },
          },
        },
      });
    }

    res.json({
      message: 'Joined group successfully',
      group,
    });
  } catch (error) {
    console.error('❌ Error joining group:', error);
    res.status(500).json({
      error: 'Error joining group',
      details: error.message,
    });
  }
});

module.exports = router;
