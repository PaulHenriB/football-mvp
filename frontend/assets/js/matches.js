// asset/js/matches.js
import { request, API_ENDPOINTS } from './api.js';

async function loadMatches() {
  try {
    const matches = await request(API_ENDPOINTS.MATCHES_LIST);
    const list = document.getElementById('matches-list');
    list.innerHTML = matches.length
      ? matches.map(m => `<li><a href="/matchdetails.html?id=${m.id}">${new Date(m.date).toLocaleString()} - ${m.location}</a></li>`).join('')
      : '<li>No matches</li>';
  } catch (err) {
    console.error(err);
    document.getElementById('matches-list').innerHTML = '<li>Error loading matches</li>';
  }
}

document.addEventListener('DOMContentLoaded', loadMatches);
