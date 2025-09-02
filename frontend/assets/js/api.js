// /public/js/api.js
const BASE = (window.__API_BASE__ && window.__API_BASE__) || (window.location.origin + '/'); 
// If you host backend on different host/port, set window.__API_BASE__ in HTML before loading this script.
// Example: <script>window.__API_BASE__ = 'http://localhost:5000'</script>

const API_ENDPOINTS = {
  // edit if your server uses a different prefix
  AUTH_REGISTER: `${BASE}users/register`,
  AUTH_LOGIN: `${BASE}users/login`,
  AUTH_ME: `${BASE}users/me`,

  MATCHES_OPEN: `${BASE}matches/open`,
  MATCHES_CREATE: `${BASE}matches/create`, // or `${BASE}matches`
  MATCHES_ASSIGN_PLAYERS: (id) => `${BASE}matches/${id}/players`,
  MATCHES_JOIN: (id) => `${BASE}matches/${id}/join`,
  MATCHES_RATE: (id) => `${BASE}matches/${id}/rate`,
  MATCHES_BALANCE: (id, mode='') => `${BASE}matches/${id}/balance${mode ? '?mode=' + mode : ''}`,

  PLAYERS_LIST: `${BASE}players`,
  PLAYERS_PROFILE: (id) => `${BASE}players/${id}`,
};

function getToken() {
  return localStorage.getItem('accessToken');
}

function setToken(token) {
  localStorage.setItem('accessToken', token);
}

function clearToken() {
  localStorage.removeItem('accessToken');
}

async function apiFetch(url, options = {}) {
  const headers = options.headers || {};
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  // handle 401 centrally
  if (res.status === 401) {
    clearToken();
    // redirect to login (optional)
    // window.location.href = '/login.html';
    throw new Error('Unauthorized');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && data.error) || (data && data.message) || res.statusText;
    throw new Error(message);
  }
  return data;
}
