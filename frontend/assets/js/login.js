// public/js/login.js
import { request, API_ENDPOINTS } from './api.js';
import { setToken, parseJwt } from './auth-helper.js';

const form = document.getElementById('login-form');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;

    try {
      const data = await request(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        body: { email, password }
      });

      // Expect backend to return { token: '...' }
      if (data?.token) {
        setToken(data.token);
        // optional: parse for user info
        const payload = parseJwt(data.token);
        // redirect to dashboard
        window.location.href = '/dashboard.html';
      } else {
        throw new Error('No token returned from server');
      }
    } catch (err) {
      console.error(err);
      showMessage(err.message || 'Login failed', 'error');
    }
  });
}

/** simple UI helper */
function showMessage(text, type = 'info') {
  let el = document.getElementById('login-msg');
  if (!el) {
    el = document.createElement('div');
    el.id = 'login-msg';
    document.body.prepend(el);
  }
  el.textContent = text;
  el.className = type;
}
