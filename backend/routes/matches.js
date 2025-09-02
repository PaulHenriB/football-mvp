// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const {
  getMatches,
  createMatch,
  updateMatch,
  getMatchPlayers,
  ratePlayer,
  setAvailability,
  getBalancedTeams,
} = require('../controllers/matchController');

// GET /api/matches → list all matches
router.get('/', getMatches);

// POST /api/matches → create a new match
router.post('/', createMatch);

// PUT /api/matches/:id → update match info
router.put('/:id', updateMatch);

// GET /api/matches/:id/players → list players for a match
router.get('/:id/players', getMatchPlayers);

// POST /api/matches/:id/rate → rate a player
router.post('/:id/rate', ratePlayer);

// POST /api/matches/:id/availability → set player availability
router.post('/:id/availability', setAvailability);

// GET /api/matches/:id/teams → get balanced teams
router.get('/:id/teams', getBalancedTeams);

module.exports = router;
