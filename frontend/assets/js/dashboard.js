import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const container = document.getElementById("dashboard");

  try {
    const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });
    container.innerHTML = `<h2>Welcome, ${user.name}</h2>
      <p>Email: ${user.email}</p>`;
  } catch (err) {
    console.error("Error loading dashboard:", err);
    container.innerHTML = "<p>Error loading dashboard.</p>";
  }
});
