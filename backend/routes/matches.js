// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../utils/authMiddleware'); // JWT middleware

// import controller methods
const {
  getMatches,
  createMatch,
  updateMatch,
  getMatchPlayers,
  ratePlayer,
  setAvailability,
  getBalancedTeams,
  finishMatch,      // new
  getPlayerRatings, // new
} = require('../controllers/matchController');

// ---------------- ROUTES ---------------- //

// GET all matches
router.get('/', getMatches);

// POST create new match (authenticated)
router.post('/', authenticate, createMatch);

// PUT update match info (authenticated)
router.put('/:id', authenticate, updateMatch);

// GET players for a match
router.get('/:id/players', getMatchPlayers);

// POST availability for a player
router.post('/:id/availability', authenticate, setAvailability);

// GET balanced teams for a match
router.get('/:id/teams', getBalancedTeams);

// POST rate a player (authenticated)
router.post('/:id/rate', authenticate, ratePlayer);

// PUT set final result (only managers, authenticated)
router.put('/:id/result', authenticate, finishMatch);

// GET ratings + average for a player
router.get('/players/:id/ratings', getPlayerRatings);

module.exports = router;
