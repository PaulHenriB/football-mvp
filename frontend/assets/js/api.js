// asset/js/api.js

const API_BASE_URL = "http://localhost:5000/api"; // adjust if backend runs elsewhere

export const API_ENDPOINTS = {
  // === AUTH / USERS ===
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  ME: `${API_BASE_URL}/users/me`,

  // === MATCHES ===
  MATCHES: `${API_BASE_URL}/matches`,              // GET all, POST create
  MATCH_BY_ID: (id) => `${API_BASE_URL}/matches/${id}`, // PUT update
  MATCH_PLAYERS: (id) => `${API_BASE_URL}/matches/${id}/players`,
  MATCH_RATE_PLAYER: (id) => `${API_BASE_URL}/matches/${id}/rate`,
  MATCH_AVAILABILITY: (id) => `${API_BASE_URL}/matches/${id}/availability`,
  MATCH_TEAMS: (id) => `${API_BASE_URL}/matches/${id}/teams`,

  // === PLAYERS ===
  PLAYERS: `${API_BASE_URL}/players`,              // GET all, POST create
  PLAYER_BY_ID: (id) => `${API_BASE_URL}/players/${id}`, // PUT update, DELETE remove
  AVAILABLE_PLAYERS: (date) => `${API_BASE_URL}/players/available?date=${date}`,
};
