// asset/js/matchdetails.js
import { request, API_ENDPOINTS } from './api.js';

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function loadDetails() {
  const id = getQueryParam('id');
  if (!id) return;

  try {
    const match = await request(API_ENDPOINTS.MATCH_DETAILS(id));
    document.getElementById('match-title').textContent = `Match on ${new Date(match.date).toLocaleString()}`;
    // populate other fields...
  } catch (err) {
    console.error(err);
    document.getElementById('match-title').textContent = 'Failed to load match';
  }
}

document.addEventListener('DOMContentLoaded', loadDetails);

  
