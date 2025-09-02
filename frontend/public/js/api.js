// public/js/api.js
import { getToken, removeToken } from './auth-helper.js';

export const API_ENDPOINTS = {
  // -- Replace these defaults with your actual backend endpoints --
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  MATCHES_LIST: '/matches',                // GET
  MATCH_CREATE: '/matches/create',         // POST
  MATCH_DETAILS: (id) => `/matches/${id}`, // GET
  PLAYER_PROFILE: (id) => `/players/${id}`,
  // add other endpoints here...
};

/**
 * Generic fetch wrapper that adds Authorization header when a token is present,
 * handles JSON parsing, and basic error handling (401 -> remove token).
 */
export async function request(path, opts = {}) {
  const token = getToken();
  const headers = opts.headers ? { ...opts.headers } : {};

  // Set JSON headers by default for body sending
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    if (typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...opts, headers, credentials: 'same-origin' });

  // Logout on 401
  if (res.status === 401) {
    removeToken();
    // optional: redirect to login page if desired
    // window.location = '/login.html';
    throw new Error('Unauthorized (401)');
  }

  // Try parse JSON, but some endpoints may return empty 204
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.message || res.statusText || 'API Error');
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
