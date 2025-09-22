// frontend/assets/js/signup.js
import { apiRequest, API_ENDPOINTS } from "./api.js";
import { setToken } from "./auth-helper.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");

  // Error and success elements
  const nameError = document.getElementById("name-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const successMessage = document.getElementById("success-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset messages
    [nameError, emailError, passwordError].forEach(el => {
      el.textContent = "";
      el.style.display = "none";
    });
    successMessage.textContent = "";
    successMessage.style.display = "none";

    // Gather values
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const roleSelection = document.querySelector("input[name='role']:checked")?.value || "PLAYER";

    let hasError = false;

    // Basic validation
    if (!name) {
      nameError.textContent = "Name is required.";
      nameError.style.display = "block";
      hasError = true;
    }
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      emailError.textContent = "Enter a valid email address.";
      emailError.style.display = "block";
      hasError = true;
    }
    if (!password || password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters.";
      passwordError.style.display = "block";
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({ name, email, password, role: roleSelection }),
      });

      if (response?.token) {
        setToken(response.token);
        successMessage.textContent = "✅ Account created successfully! Redirecting...";
        successMessage.style.display = "block";

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1500);
      } else {
        emailError.textContent = response?.message || "Signup failed. Please try again.";
        emailError.style.display = "block";
      }
    } catch (err) {
      console.error("Signup error:", err);
      emailError.textContent = "⚠️ Server error. Please try again later.";
      emailError.style.display = "block";
    }
  });
});

