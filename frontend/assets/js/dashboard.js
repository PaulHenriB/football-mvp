import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  try {
    // Load user info
    const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });
    document.getElementById("user-name").textContent = user.firstName || "Player";

    // Load stats
    await loadStats(user.id);

    // Load matches
    await loadUpcomingMatches();

    // Load availability
    renderAvailability(user.availability || []);
  } catch (err) {
    console.error("Error loading dashboard:", err);
    document.getElementById("dashboard").innerHTML = "<p class='alert alert--error'>Error loading dashboard.</p>";
  }
});

/**
 * Load user stats
 */
async function loadStats(userId) {
  try {
    const stats = await apiRequest(`${API_ENDPOINTS.PLAYERS}/${userId}/stats`, {
      method: "GET",
    });

    document.getElementById("stat-matches").textContent = stats.matchesPlayed || 0;
    document.getElementById("stat-wins").textContent = stats.wins || 0;
    document.getElementById("stat-goals").textContent = stats.goals || 0;
    document.getElementById("stat-rating").textContent =
      stats.avgRating ? stats.avgRating.toFixed(2) : "-";
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}

/**
 * Load upcoming matches
 */
async function loadUpcomingMatches() {
  const container = document.getElementById("matches-list");
  container.innerHTML = "<li>Loading...</li>";

  try {
    const matches = await apiRequest(API_ENDPOINTS.UPCOMING_MATCHES, { method: "GET" });
    if (!matches.length) {
      container.innerHTML = "<li>No upcoming matches.</li>";
      return;
    }

    container.innerHTML = matches
      .map(
        (m) => `
        <li>
          <strong>${m.name || "Match"}</strong> – ${m.date} @ ${m.location}
        </li>
      `
      )
      .join("");
  } catch (err) {
    console.error("Error fetching upcoming matches:", err);
    container.innerHTML = "<li class='text-muted'>Error loading matches.</li>";
  }
}

/**
 * Render availability
 */
function renderAvailability(availability) {
  const container = document.getElementById("availability-list");
  if (!availability.length) {
    container.innerHTML = "<li>No availability set.</li>";
    return;
  }

  container.innerHTML = availability
    .map((a) => `<li>${a.date}: ${a.status}</li>`)
    .join("");
}
