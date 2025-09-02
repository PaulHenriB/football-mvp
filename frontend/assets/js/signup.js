import { apiRequest, API_ENDPOINTS } from "./api.js";
import { setToken } from "./auth-helper.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      if (response.token) {
        setToken(response.token);
        window.location.href = "dashboard.html";
      } else {
        alert("Signup failed. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error signing up. Please try again later.");
    }
  });
});

