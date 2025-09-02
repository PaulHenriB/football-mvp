// backend/routes/players.js
const express = require('express');
const router = express.Router();
const {
  getPlayers,
  getAvailablePlayers,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require('../controllers/playerController');

// GET /api/players → list all players
router.get('/', getPlayers);

// GET /api/players/available?date=YYYY-MM-DD
router.get('/available', getAvailablePlayers);

// POST /api/players → create a new player
router.post('/', createPlayer);

// PUT /api/players/:id → update a player
router.put('/:id', updatePlayer);

// DELETE /api/players/:id → delete a player
router.delete('/:id', deletePlayer);

module.exports = router;
