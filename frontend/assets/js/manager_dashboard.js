import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();
  await loadUpcomingMatches();
  await loadAvailability();
  setupScheduleForm();
});

/**
 * Load manager's upcoming matches with cancel/edit actions
 */
async function loadUpcomingMatches() {
  const container = document.getElementById("dashboard-upcoming");
  container.innerHTML = "<p>Loading upcoming matches...</p>";

  try {
    const matches = await apiRequest(API_ENDPOINTS.MANAGER_UPCOMING_MATCHES, { method: "GET" });

    container.innerHTML = matches.length
      ? matches.map(renderManagerMatchCard).join("")
      : "<p>No upcoming matches scheduled.</p>";

    attachManagerMatchHandlers(container);
  } catch (err) {
    console.error("Error fetching manager matches:", err);
    container.innerHTML = "<p>Failed to load upcoming matches.</p>";
  }
}

/**
 * Render a match card with manager actions
 */
function renderManagerMatchCard(match) {
  return `
    <div class="match-card card">
      <h4>${match.name}</h4>
      <p><strong>Date:</strong> ${match.date}</p>
      <p><strong>Location:</strong> ${match.location}</p>
      <div class="actions">
        <button class="secondary-btn view-details-btn" data-id="${match.id}">
          View Details
        </button>
        <button class="secondary-btn edit-btn" data-id="${match.id}">
          Edit
        </button>
        <button class="danger-btn cancel-btn" data-id="${match.id}">
          Cancel
        </button>
      </div>
    </div>
  `;
}

/**
 * Attach handlers (details, edit, cancel)
 */
function attachManagerMatchHandlers(container) {
  container.querySelectorAll(".view-details-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await openMatchDetails(btn.dataset.id);
    });
  });

  container.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert(`Edit match ${btn.dataset.id} (placeholder for future feature).`);
    });
  });

  container.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Are you sure you want to cancel this match?")) return;
      await handleCancelMatch(btn.dataset.id);
    });
  });
}

/**
 * Cancel a match
 */
async function handleCancelMatch(matchId) {
  try {
    await apiRequest(API_ENDPOINTS.CANCEL_MATCH(matchId), { method: "DELETE" });
    alert("Match cancelled successfully.");
    await loadUpcomingMatches(); // refresh
  } catch (err) {
    console.error("Error cancelling match:", err);
    alert("Failed to cancel the match.");
  }
}

/**
 * Open match details in modal (shared logic from matches.js)
 */
async function openMatchDetails(matchId) {
  const modal = document.getElementById("matchDetailsModal");
  const content = document.getElementById("match-details-content");

  content.innerHTML = "<p>Loading match details...</p>";

  try {
    const match = await apiRequest(API_ENDPOINTS.MATCH_BY_ID(matchId), { method: "GET" });
    content.innerHTML = `
      <h3>${match.name}</h3>
      <p><strong>Date:</strong> ${match.date}</p>
      <p><strong>Location:</strong> ${match.location}</p>
      <p><strong>Status:</strong> ${match.status}</p>
    `;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  } catch (err) {
    console.error("Error loading match details:", err);
    content.innerHTML = "<p>Failed to load match details.</p>";
  }
}

/**
 * Load player availability (placeholder for expansion)
 */
async function loadAvailability() {
  const container = document.getElementById("dashboard-availability");
  container.innerHTML = "<p>Loading availability...</p>";

  try {
    const availability = await apiRequest(API_ENDPOINTS.AVAILABILITY, { method: "GET" });
    container.innerHTML = availability.length
      ? availability.map((a) => `<p>${a.playerName}: ${a.status}</p>`).join("")
      : "<p>No availability data yet.</p>";
  } catch (err) {
    console.error("Error loading availability:", err);
    container.innerHTML = "<p>Failed to load availability.</p>";
  }
}

/**
 * Handle schedule form submission
 */
function setupScheduleForm() {
  const form = document.getElementById("schedule-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form).entries());
    try {
      await apiRequest(API_ENDPOINTS.CREATE_MATCH, {
        method: "POST",
        body: JSON.stringify(formData),
      });
      alert("Match scheduled successfully!");
      form.reset();
      document.querySelector("[data-modal-close]").click();
      await loadUpcomingMatches();
    } catch (err) {
      console.error("Error scheduling match:", err);
      alert("Failed to schedule match.");
    }
  });
}
