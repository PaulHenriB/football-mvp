import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const container = document.getElementById("match-details");
  const id = getQueryParam("id");

  if (!id) {
    container.innerHTML = "<p>No match ID provided.</p>";
    return;
  }

  try {
    const match = await apiRequest(API_ENDPOINTS.MATCH_BY_ID(id), { method: "GET" });
    container.innerHTML = `
      <h2>${match.name}</h2>
      <p>Date: ${match.date}</p>
      <p>Location: ${match.location}</p>
    `;
  } catch (err) {
    console.error("Error loading match details:", err);
    container.innerHTML = "<p>Error loading match.</p>";
  }
});

  
