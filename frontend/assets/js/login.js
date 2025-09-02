import { apiRequest, API_ENDPOINTS } from "./api.js";
import { setToken } from "./auth-helper.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.token) {
        setToken(response.token);
        window.location.href = "dashboard.html";
      } else {
        alert("Invalid login. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging in. Please try again later.");
    }
  });
});
