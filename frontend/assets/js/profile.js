// js/profile.js
import { request, API_ENDPOINTS } from './api.js';

async function loadProfile() {
  try {
    const user = await request(API_ENDPOINTS.AUTH_ME);
    document.getElementById('profile-name').textContent = user.name || user.email;
    // fill other profile fields...
  } catch (err) {
    console.error('Failed to load profile', err);
  }
}

document.addEventListener('DOMContentLoaded', loadProfile);
