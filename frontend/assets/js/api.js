// frontend/assets/js/api.js

import { getToken, isExpired, removeToken } from "./auth-helper.js";

const API_BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // --- Auth & Users ---
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  ME: `${API_BASE_URL}/users/me`,

  // --- Generic Matches ---
  MATCHES: `${API_BASE_URL}/matches`,
  UPCOMING_MATCHES: `${API_BASE_URL}/matches/upcoming`,
  PAST_MATCHES: `${API_BASE_URL}/matches/past`,
  OPEN_MATCHES: `${API_BASE_URL}/matches/open`,

  MATCH_BY_ID: (id) => `${API_BASE_URL}/matches/${id}`,
  MATCH_DETAILS: (id) => `${API_BASE_URL}/matches/${id}`,
  MATCH_PLAYERS: (id) => `${API_BASE_URL}/matches/${id}/players`,
  MATCH_RATE_PLAYER: (id) => `${API_BASE_URL}/matches/${id}/rate`,
  MATCH_AVAILABILITY: (id) => `${API_BASE_URL}/matches/${id}/availability`,
  MATCH_TEAMS: (id) => `${API_BASE_URL}/matches/${id}/teams`,

  // --- Match Actions ---
  JOIN_MATCH: (id) => `${API_BASE_URL}/matches/join/${id}`,
  CANCEL_MATCH: (id) => `${API_BASE_URL}/matches/cancel/${id}`,

  // --- Manager-specific ---
  MANAGER_UPCOMING_MATCHES: `${API_BASE_URL}/matches/manager/upcoming`,
  SAVE_TEAMS: (id) => `${API_BASE_URL}/matches/${id}/save-teams`, // ✅ save balancer output
  MATCH_RESULT: (id) => `${API_BASE_URL}/matches/${id}/result`,   // ✅ new for recording final scores

  // --- Player-specific ---
  PLAYER_MATCHES: (playerId) => `${API_BASE_URL}/players/${playerId}/matches`,
  PLAYER_UPCOMING_MATCHES: (playerId) => `${API_BASE_URL}/players/${playerId}/matches/upcoming`,
  PLAYER_REGISTERED_MATCHES: (playerId) => `${API_BASE_URL}/players/${playerId}/matches/registered`,
  PLAYER_PAST_MATCHES: (playerId) => `${API_BASE_URL}/players/${playerId}/matches/past`,

  // --- Players ---
  PLAYERS: `${API_BASE_URL}/players`,
  PLAYER_BY_ID: (id) => `${API_BASE_URL}/players/${id}`,
  AVAILABLE_PLAYERS: (date) => `${API_BASE_URL}/players/available?date=${date}`,
};

// --- API Fetch Helper ---
export async function apiFetch(endpoint, options = {}) {
  let token = getToken();

  if (token && isExpired(token)) {
    console.warn("JWT expired, removing token.");
    removeToken();
    window.location.href = "/login.html";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

// --- Convenience wrapper for JSON-based requests ---
export async function apiRequest(endpoint, method = "GET", body = null, headers = {}) {
  return apiFetch(endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
}
