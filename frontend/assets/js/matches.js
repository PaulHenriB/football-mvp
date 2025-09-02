import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const container = document.getElementById("matches-list");

  try {
    const matches = await apiRequest(API_ENDPOINTS.MATCHES, { method: "GET" });
    container.innerHTML = matches.map(
      m => `<li><a href="matchdetails.html?id=${m.id}">${m.name} (${m.date})</a></li>`
    ).join("");
  } catch (err) {
    console.error("Error loading matches:", err);
    container.innerHTML = "<p>Error loading matches.</p>";
  }
});
