// public/js/signup.js
import { request, API_ENDPOINTS } from './api.js';
import { setToken } from './auth-helper.js';

const form = document.getElementById('signup-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    // convert formData to object
    const body = {};
    for (const [k, v] of formData.entries()) body[k] = v;

    try {
      const data = await request(API_ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        body
      });

      // If backend returns token on registration, save and redirect
      if (data?.token) {
        setToken(data.token);
        window.location.href = '/dashboard.html';
        return;
      }

      showMessage('Account created. Please login.', 'success');
      // optionally redirect after a delay:
      // setTimeout(() => window.location.href = '/login.html', 1200);
    } catch (err) {
      console.error(err);
      showMessage(err.body?.message || err.message || 'Registration failed', 'error');
    }
  });
}

function showMessage(text, type = 'info') {
  let el = document.getElementById('signup-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'signup-msg';
    document.body.prepend(el);
  }
  el.textContent = text;
  el.className = type;
}
