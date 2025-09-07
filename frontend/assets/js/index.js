// frontend/asset/js/index.js

import { apiRequest, API_ENDPOINTS } from "/js/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const signupLink = document.getElementById("signup-link");
  const loginBtn = document.getElementById("login-btn");
  const logoutLink = document.getElementById("logout-link");
  const navLinks = document.getElementById("nav-links");
  const hamburger = document.querySelector(".hamburger");

  const token = localStorage.getItem("token");

  // ---------- Auth UI Handling ----------
  if (!token) {
    // Not logged in → show Sign Up & Log In
    if (signupLink) signupLink.style.display = "inline-block";
    if (loginBtn) loginBtn.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "none";
  } else {
    try {
      // Verify token by calling /me endpoint
      const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });

      if (user) {
        // Authenticated → adjust UI
        if (signupLink) signupLink.style.display = "none";
        if (loginBtn) {
          loginBtn.textContent = "Go to Dashboard";
          loginBtn.setAttribute("href", "dashboard.html");
        }
        if (logoutLink) {
          logoutLink.style.display = "inline-block";
          logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.href = "login.html";
          });
        }
      }
    } catch (err) {
      console.error("Token validation failed:", err);
      // Clear invalid token
      localStorage.removeItem("token");
      if (signupLink) signupLink.style.display = "inline-block";
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutLink) logoutLink.style.display = "none";
    }
  }

  // ---------- Mobile Hamburger Menu ----------
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("nav-open");
    });
  }
});
