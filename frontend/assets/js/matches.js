// frontend/assets/js/matches.js

import { API_ENDPOINTS, apiRequest } from "./api.js";
import { openModal, closeModal } from "./modal.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(btn => btn.classList.remove("active"));
      contents.forEach(content => content.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });

  loadMatches();
});

// Load matches for each tab
async function loadMatches() {
  await loadUpcomingMatches();
  await loadPastMatches();
  await loadOpenMatches();
}

async function loadUpcomingMatches() {
  try {
    const matches = await apiRequest(API_ENDPOINTS.UPCOMING_MATCHES, "GET");
    const managerMatches = await apiRequest(API_ENDPOINTS.MANAGER_UPCOMING_MATCHES, "GET");
    const managerMatchIds = new Set(managerMatches.map(m => m.id));

    renderMatchList("upcoming-list", matches, { managerMatchIds });
  } catch (err) {
    console.error("Error loading upcoming matches", err);
  }
}

async function loadPastMatches() {
  try {
    const matches = await apiRequest(API_ENDPOINTS.PAST_MATCHES, "GET");
    renderMatchList("past-list", matches);
  } catch (err) {
    console.error("Error loading past matches", err);
  }
}

async function loadOpenMatches() {
  try {
    const matches = await apiRequest(API_ENDPOINTS.OPEN_MATCHES, "GET");
    renderMatchList("open-list", matches);
  } catch (err) {
    console.error("Error loading open matches", err);
  }
}

// Render a match list with action buttons
function renderMatchList(containerId, matches, options = {}) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!matches || matches.length === 0) {
    container.innerHTML = `<p>No matches found.</p>`;
    return;
  }

  matches.forEach(match => {
    const matchCard = document.createElement("div");
    matchCard.className = "match-card card";

    matchCard.innerHTML = `
      <h4>${match.title}</h4>
      <p>${new Date(match.date).toLocaleString()}</p>
      <div class="match-actions">
        <button class="btn primary-btn" data-action="join" data-id="${match.id}">Join</button>
        <button class="btn secondary-btn" data-action="details" data-id="${match.id}">View Details</button>
        ${options.managerMatchIds?.has(match.id)
          ? `<button class="btn danger-btn" data-action="cancel" data-id="${match.id}">Cancel</button>`
          : ""}
      </div>
    `;

    container.appendChild(matchCard);
  });

  attachMatchEvents(container);
}

// Attach events to match action buttons
function attachMatchEvents(container) {
  container.querySelectorAll("button[data-action]").forEach(button => {
    const matchId = button.dataset.id;
    const action = button.dataset.action;

    button.addEventListener("click", async () => {
      if (action === "details") {
        await showMatchDetails(matchId);
      } else if (action === "join") {
        await joinMatch(matchId);
      } else if (action === "cancel") {
        await cancelMatch(matchId);
      }
    });
  });
}

// Show match details in modal
async function showMatchDetails(matchId) {
  try {
    const match = await apiRequest(`${API_ENDPOINTS.MATCH_DETAILS}/${matchId}`, "GET");

    const content = document.getElementById("match-details-content");
    content.innerHTML = `
      <h5>${match.title}</h5>
      <p><strong>Date:</strong> ${new Date(match.date).toLocaleString()}</p>
      <p><strong>Location:</strong> ${match.location}</p>
      <p><strong>Players Registered:</strong> ${match.players?.length || 0}</p>
      <ul>
        ${match.players?.map(player => `<li>${player.name}</li>`).join("") || "<li>No players yet</li>"}
      </ul>
    `;

    openModal("matchDetailsModal");
  } catch (err) {
    console.error("Error fetching match details", err);
  }
}

// Join match
async function joinMatch(matchId) {
  try {
    await apiRequest(`${API_ENDPOINTS.JOIN_MATCH}/${matchId}`, "POST");
    alert("You joined the match!");
    await loadMatches();
  } catch (err) {
    console.error("Error joining match", err);
    alert("Failed to join match.");
  }
}

// Cancel match (Manager only)
async function cancelMatch(matchId) {
  if (!confirm("Are you sure you want to cancel this match?")) return;

  try {
    await apiRequest(`${API_ENDPOINTS.CANCEL_MATCH}/${matchId}`, "DELETE");
    alert("Match canceled.");
    await loadMatches();
  } catch (err) {
    console.error("Error canceling match", err);
    alert("Failed to cancel match.");
  }
}

