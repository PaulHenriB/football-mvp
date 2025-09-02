import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const container = document.getElementById("profile");

  try {
    const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });
    container.innerHTML = `
      <h2>${user.name}</h2>
      <p>Email: ${user.email}</p>
      <p>Position: ${user.position || "Not set"}</p>
    `;
  } catch (err) {
    console.error("Error loading profile:", err);
    container.innerHTML = "<p>Error loading profile.</p>";
  }
});
