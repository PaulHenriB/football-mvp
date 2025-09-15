// frontend/assets/js/login.js
import { apiRequest, API_ENDPOINTS } from "./api.js";
import { setToken } from "./auth-helper.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const successMessage = document.getElementById("success-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset messages
    emailError.style.display = "none";
    passwordError.style.display = "none";
    successMessage.style.display = "none";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let hasError = false;

    if (!email) {
      emailError.textContent = "Email is required.";
      emailError.style.display = "block";
      hasError = true;
    }
    if (!password) {
      passwordError.textContent = "Password is required.";
      passwordError.style.display = "block";
      hasError = true;
    }
    if (hasError) return;

    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        setToken(response.token);
        successMessage.textContent = "✅ Login successful! Redirecting...";
        successMessage.style.display = "block";
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        passwordError.textContent = "Invalid email or password.";
        passwordError.style.display = "block";
      }
    } catch (err) {
      console.error("Login error:", err);
      passwordError.textContent = "⚠️ Error logging in. Please try again later.";
      passwordError.style.display = "block";
    }
  });
});
