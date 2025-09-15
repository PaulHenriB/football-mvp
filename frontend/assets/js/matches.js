import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  setupTabs();

  await Promise.all([
    loadUpcomingMatches(),
    loadPastMatches(),
    loadOpenMatches(),
  ]);
});

/**
 * Setup tab switching
 */
function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      tabContents.forEach((tc) => tc.classList.remove("active"));
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

/**
 * Load Upcoming Matches
 */
async function loadUpcomingMatches() {
  const container = document.getElementById("upcoming-list");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const matches = await apiRequest(API_ENDPOINTS.UPCOMING_MATCHES, { method: "GET" });
    container.innerHTML = matches.length
      ? matches.map(renderMatchCard).join("")
      : "<p>No upcoming matches.</p>";
  } catch (err) {
    console.error("Error fetching upcoming matches:", err);
    container.innerHTML = "<p>Error loading upcoming matches.</p>";
  }
}

/**
 * Load Past Matches
 */
async function loadPastMatches() {
  const container = document.getElementById("past-list");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const matches = await apiRequest(API_ENDPOINTS.PAST_MATCHES, { method: "GET" });
    container.innerHTML = matches.length
      ? matches.map(renderMatchCard).join("")
      : "<p>No past matches.</p>";
  } catch (err) {
    console.error("Error fetching past matches:", err);
    container.innerHTML = "<p>Error loading past matches.</p>";
  }
}

/**
 * Load Open Matches
 */
async function loadOpenMatches() {
  const container = document.getElementById("open-list");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const matches = await apiRequest(API_ENDPOINTS.OPEN_MATCHES, { method: "GET" });
    if (!matches.length) {
      container.innerHTML = "<p>No open matches available.</p>";
      return;
    }

    container.innerHTML = matches.map(renderOpenMatchCard).join("");

    // Attach join handlers
    document.querySelectorAll(".join-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const matchId = e.target.dataset.id;
        await handleJoinMatch(matchId);
      });
    });
  } catch (err) {
    console.error("Error fetching open matches:", err);
    container.innerHTML = "<p>Error loading open matches.</p>";
  }
}

/**
 * Render match card (shared for upcoming & past)
 */
function renderMatchCard(match) {
  return `
    <div class="match-card card">
      <h4>${match.name || "Match"}</h4>
      <p><strong>Date:</strong> ${match.date}</p>
      <p><strong>Location:</strong> ${match.location}</p>
      ${match.result ? `<p><strong>Result:</strong> ${match.result}</p>` : ""}
    </div>
  `;
}

/**
 * Render open match card (with join button)
 */
function renderOpenMatchCard(match) {
  const spotsLeft = match.spots - match.players.length;
  const isClosed = spotsLeft <= 0;

  return `
    <div class="match-card card">
      <h4>${match.name || "Match"}</h4>
      <p><strong>Date:</strong> ${match.date}</p>
      <p><strong>Location:</strong> ${match.location}</p>
      <p><strong>Spots Left:</strong> ${spotsLeft}</p>
      <button class="primary-btn join-btn" data-id="${match.id}" ${isClosed ? "disabled" : ""}>
        ${isClosed ? "Closed" : "Join"}
      </button>
    </div>
  `;
}

/**
 * Handle Join Match
 */
async function handleJoinMatch(matchId) {
  try {
    await apiRequest(API_ENDPOINTS.JOIN_MATCH(matchId), { method: "POST" });
    alert("You successfully joined the match!");
    await loadOpenMatches(); // refresh list
  } catch (err) {
    console.error("Error joining match:", err);
    alert("Failed to join the match. Please try again.");
  }
}
