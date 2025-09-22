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
  loadManagerMatchesForBalancer();
});

// ===========================
// LOAD MATCHES (tabs)
// ===========================
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

// ===========================
// RENDER MATCH LIST
// ===========================
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
        <button class="btn secondary-btn" data-action="details" data-id="${match.id}">View</button>
        ${options.managerMatchIds?.has(match.id)
          ? `
            <button class="btn primary-btn" data-action="manage-teams" data-id="${match.id}">Manage Teams</button>
            <button class="btn danger-btn" data-action="record-result" data-id="${match.id}">Record Result</button>
          `
          : `<button class="btn primary-btn" data-action="join" data-id="${match.id}">Join</button>`
        }
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
      } else if (action === "manage-teams") {
        document.querySelector(".tab-btn[data-tab='balancer']").click();
        document.getElementById("match-select").value = matchId;
        await loadBalancerPlayers(matchId);
      } else if (action === "record-result") {
        await showMatchDetails(matchId, { forceResultForm: true });
      }
    });
  });
}

// ===========================
// TEAM BALANCER INTEGRATION
// ===========================
async function loadManagerMatchesForBalancer() {
  try {
    const matches = await apiRequest(API_ENDPOINTS.MANAGER_UPCOMING_MATCHES, "GET");
    const select = document.getElementById("match-select");

    select.innerHTML = `<option value="">-- Select a Match --</option>`;

    matches.forEach(m => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.title} (${new Date(m.date).toLocaleDateString()})`;
      select.appendChild(opt);
    });

    select.addEventListener("change", async () => {
      const matchId = select.value;
      if (matchId) {
        await loadBalancerPlayers(matchId);
      }
    });
  } catch (err) {
    console.error("Error loading manager matches for balancer", err);
  }
}

async function loadBalancerPlayers(matchId) {
  try {
    const match = await apiRequest(API_ENDPOINTS.MATCH_DETAILS(matchId), "GET");

    document.getElementById("team1-list").innerHTML = "";
    document.getElementById("team2-list").innerHTML = "";

    if (!match.players || match.players.length === 0) {
      document.getElementById("team1-list").innerHTML = "<li>No players</li>";
      document.getElementById("team2-list").innerHTML = "<li>No players</li>";
      return;
    }

    match.players.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (rating: ${p.rating ?? "N/A"})`;
      li.dataset.playerId = p.id;
      document.getElementById("team1-list").appendChild(li);
    });

    document.getElementById("auto-balance").onclick = () => autoBalanceTeams(matchId, match.players);
    document.getElementById("save-teams").onclick = () => saveTeams(matchId);
  } catch (err) {
    console.error("Error loading balancer players", err);
  }
}

async function autoBalanceTeams(matchId, players) {
  try {
    const result = await apiRequest("/api/team-balance", "POST", { players });

    const team1 = document.getElementById("team1-list");
    const team2 = document.getElementById("team2-list");
    team1.innerHTML = "";
    team2.innerHTML = "";

    result.teamA.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (rating: ${p.rating ?? "N/A"})`;
      li.dataset.playerId = p.id;
      team1.appendChild(li);
    });

    result.teamB.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (rating: ${p.rating ?? "N/A"})`;
      li.dataset.playerId = p.id;
      team2.appendChild(li);
    });

    console.log("Balancer summary:", result.summary);
    alert(`Balanced teams!\nAvg A: ${result.summary.averageRatingA}\nAvg B: ${result.summary.averageRatingB}\nDiff: ${result.summary.difference}`);
  } catch (err) {
    console.error("Error auto-balancing teams", err);
    alert("Failed to balance teams");
  }
}

async function saveTeams(matchId) {
  const team1 = [...document.querySelectorAll("#team1-list li")].map(li => li.dataset.playerId);
  const team2 = [...document.querySelectorAll("#team2-list li")].map(li => li.dataset.playerId);

  try {
    await apiRequest(API_ENDPOINTS.SAVE_TEAMS(matchId), "POST", { team1, team2 });
    alert("Teams saved successfully!");
  } catch (err) {
    console.error("Error saving teams", err);
    alert("Failed to save teams");
  }
}

// ===========================
// MATCH DETAILS & RESULTS
// ===========================
async function showMatchDetails(matchId, options = {}) {
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

      ${(match.isManager && (options.forceResultForm || match.status !== "completed")) ? `
        <div class="section">
          <h6>Record Results & Ratings</h6>
          <form id="result-form">
            <label>Team A Score <input type="number" id="teamA-score" min="0" value="${match.teamAScore ?? ""}"></label>
            <label>Team B Score <input type="number" id="teamB-score" min="0" value="${match.teamBScore ?? ""}"></label>
            <button type="submit" class="btn primary-btn">Save</button>
          </form>
        </div>` : ""}
    `;

    openModal("matchDetailsModal");

    const resultForm = document.getElementById("result-form");
    if (resultForm) {
      resultForm.addEventListener("submit", async e => {
        e.preventDefault();
        await saveMatchResult(matchId);
      });
    }
  } catch (err) {
    console.error("Error showing match details", err);
  }
}

async function saveMatchResult(matchId) {
  const teamAScore = parseInt(document.getElementById("teamA-score").value, 10);
  const teamBScore = parseInt(document.getElementById("teamB-score").value, 10);

  try {
    await apiRequest(API_ENDPOINTS.MATCH_RESULT(matchId), "PUT", {
      teamAScore,
      teamBScore,
    });
    alert("Result saved!");
    closeModal("matchDetailsModal");
    loadMatches();
  } catch (err) {
    console.error("Error saving match result", err);
    alert("Failed to save result");
  }
}
