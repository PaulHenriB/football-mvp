// public/js/auth-guard.js
import { hasValidToken } from './auth-helper.js';

export function requireAuth(redirectTo = '/login.html') {
  if (!hasValidToken()) {
    // If token missing or expired, redirect to login
    window.location.href = redirectTo;
    return false;
  }
  return true;
}
