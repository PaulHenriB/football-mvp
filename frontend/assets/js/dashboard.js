// public/js/dashboard.js
import { request, API_ENDPOINTS } from './api.js';

async function load() {
  try {
    const matches = await request(API_ENDPOINTS.MATCHES_LIST);
    // matches expected to be an array
    const container = document.getElementById('upcoming-matches');
    if (container) {
      container.innerHTML = matches.length
        ? matches.map(m => renderMatchCard(m)).join('')
        : '<p>No upcoming matches</p>';
    }
  } catch (err) {
    console.error('Failed to load dashboard data', err);
  }
}

function renderMatchCard(m) {
  // adapt fields to your match model
  return `
    <div class="card match">
      <h3>${new Date(m.date).toLocaleString()}</h3>
      <p>${m.location || ''}</p>
      <a href="/matchdetails.html?id=${m.id}">Details</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', load);
