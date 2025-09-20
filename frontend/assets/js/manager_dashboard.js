// frontend/assets/js/manager_dashboard.js 

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

// Load matches
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

// Show match details (with results & ratings)
async function showMatchDetails(matchId) {
  try {
    const match = await apiRequest(API_ENDPOINTS.MATCH_DETAILS(matchId), "GET");

    const content = document.getElementById("match-details-content");
    content.innerHTML = `
      <h5>${match.title}</h5>
      <p><strong>Date:</strong> ${new Date(match.date).toLocaleString()}</p>
      <p><strong>Location:</strong> ${match.location}</p>
      <p><strong>Status:</strong> ${match.status}</p>

      <div class="section">
        <h6>Players</h6>
        <ul class="player-list">
          ${match.players?.map(p => `
            <li>
              ${p.name} 
              ${match.status === "completed" 
                ? `<input type="number" class="player-rating" data-player="${p.id}" min="0" max="10" value="${p.rating ?? ""}" placeholder="Rate"/>`
                : ""}
            </li>`).join("") || "<li>No players registered</li>"}
        </ul>
      </div>

      ${match.isManager && match.status === "completed" ? `
        <div class="section">
          <h6>Record Results & Ratings</h6>
          <form id="result-form">
            <label>Team A Score <input type="number" id="teamA-score" min="0" value="${match.teamAScore ?? ""}"></label>
            <label>Team B Score <input type="number" id="teamB-score" min="0" value="${match.teamBScore ?? ""}"></label>
            <button type="submit" class="btn primary-btn">Save</button>
          </form>
        </div>  

