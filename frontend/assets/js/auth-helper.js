// public/js/auth-helper.js

// Key in localStorage
const TOKEN_KEY = 'nextplay_token';

/**
 * Save JWT to localStorage
 * @param {string} token
 */
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Get token string (or null)
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove token
 */
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Parse a JWT without verification (client-side only)
 * returns payload object or null
 */
export function parseJwt(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(decoded)));
  } catch (e) {
    console.warn('Failed to parse JWT', e);
    return null;
  }
}

/**
 * Returns true if token expired (or missing)
 */
export function isExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

/**
 * Convenience: check currently stored token
 */
export function hasValidToken() {
  const token = getToken();
  return token && !isExpired(token);
}
