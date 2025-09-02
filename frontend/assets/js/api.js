// asset/js/api.js

import { getToken, isExpired, removeToken } from "./auth-helper.js";

const API_BASE_URL = "http://localhost:5000/api";

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  ME: `${API_BASE_URL}/users/me`,

  MATCHES: `${API_BASE_URL}/matches`,
  MATCH_BY_ID: (id) => `${API_BASE_URL}/matches/${id}`,
  MATCH_PLAYERS: (id) => `${API_BASE_URL}/matches/${id}/players`,
  MATCH_RATE_PLAYER: (id) => `${API_BASE_URL}/matches/${id}/rate`,
  MATCH_AVAILABILITY: (id) => `${API_BASE_URL}/matches/${id}/availability`,
  MATCH_TEAMS: (id) => `${API_BASE_URL}/matches/${id}/teams`,

  PLAYERS: `${API_BASE_URL}/players`,
  PLAYER_BY_ID: (id) => `${API_BASE_URL}/players/${id}`,
  AVAILABLE_PLAYERS: (date) => `${API_BASE_URL}/players/available?date=${date}`,
};

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
