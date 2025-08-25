const prisma = require('../config/prisma');

const getAvailablePlayers = async (req, res) => {
  try {
    const players = await prisma.player.findMany({
      where: { availability: true },
      select: {
        id: true,
        name: true,
        position: true,
        average_rating: true,
        availability: true
      }
    });

    res.json(players);
  } catch (error) {
    console.error('Error fetching available players:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getAvailablePlayers
};
