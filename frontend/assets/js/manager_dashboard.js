// frontend/assets/js/manager_dashboard.js
import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";
import { initModals, openModal } from "./modal.js"; // modal module

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  // initialize modal triggers
  initModals();

  const matchForm = document.getElementById("match-form");
  const matchFormWrapper = document.getElementById("match-form-wrapper");
  const upcomingList = document.getElementById("upcoming-list");
  const pastList = document.getElementById("past-list");
  const playerList = document.getElementById("player-list");
  const teamResults = document.getElementById("team-results");
  const teamBalancerLink = document.getElementById("team-balancer-link");
  const modalSchedule = document.getElementById("modal-schedule");

  // Move form *into* modal when it opens, and back when it closes.
  document.addEventListener("modal:open", (e) => {
    const modal = e.detail.modal;
    if (modal && modal.id === "modal-schedule") {
      const body = modal.querySelector(".modal__body");
      if (matchForm && body) {
        body.appendChild(matchForm);
      }
    }
  });

  document.addEventListener("modal:close", (e) => {
    const modal = e.detail.modal;
    if (modal && modal.id === "modal-schedule") {
      if (matchForm && matchFormWrapper) {
        matchFormWrapper.appendChild(matchForm); // move back to sidebar
      }
    }
  });

  // Form submission handling (works wherever the form lives)
  document.addEventListener("submit", async (evt) => {
    if (evt.target && evt.target.id === "match-form") {
      evt.preventDefault();
      const newMatch = {
        date: document.getElementById("match-date").value,
        time: document.getElementById("match-time").value,
        location: document.getElementById("match-location").value,
        duration: parseInt(document.getElementById("match-duration").value, 10),
        numberOfPlayers: parseInt(document.getElementById("match-players").value, 10),
        availableSpots: parseInt(document.getElementById("match-spots").value, 10),
      };

      try {
        await apiRequest(API_ENDPOINTS.MATCHES, {
          method: "POST",
          body: JSON.stringify(newMatch),
        });
        // close the modal if open
        if (modalSchedule && modalSchedule.classList.contains("is-open")) {
          // trigger close via data-modal-close button (fallback)
          document.querySelectorAll('[data-modal-close]').forEach(btn => btn.click());
        }
        // reset and refetch
        evt.target.reset();
        await fetchMatches();
        alert("✅ Match scheduled successfully!");
      } catch (err) {
        console.error("Error scheduling match:", err);
        alert("❌ Failed to schedule match. Please try again.");
      }
    }
  });

  // Fetch initial data
  await fetchMatches();
  await fetchPlayers();

  /* Fetch & render functions - same as before (kept for clarity) */
  async function fetchMatches() {
    try {
      const matches = await apiRequest(API_ENDPOINTS.MATCHES, { method: "GET" });
      upcomingList.innerHTML = "";
      pastList.innerHTML = "";

      const now = new Date();
      matches.forEach((match) => {
        const matchDate = new Date(`${match.date}T${match.time}`);
        const isUpcoming = matchDate > now;

        const matchEl = document.createElement("div");
        matchEl.classList.add("match");
        matchEl.innerHTML = `
          <div class="time">${match.time}</div>
          <div class="meta">
            <p><strong>${match.date}</strong> – ${match.location}</p>
            <p>⏱ ${match.duration} min • 👥 ${match.numberOfPlayers} players (Spots: ${match.availableSpots})</p>
            <span class="badge ${isUpcoming ? "badge--yellow" : "badge--green"}">
              ${isUpcoming ? "Upcoming" : "Finished"}
            </span>
            <h4>Registered Players:</h4>
            <ul>${(match.players || []).map((p) => `<li>${p.name}</li>`).join("")}</ul>
          </div>
        `;

        if (isUpcoming) upcomingList.appendChild(matchEl);
        else pastList.appendChild(matchEl);
      });
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }

  async function fetchPlayers() {
    try {
      const players = await apiRequest(API_ENDPOINTS.PLAYERS, { method: "GET" });
      playerList.innerHTML = players
        .map((p) => `<li>${p.name} (${p.position || "No position"})</li>`)
        .join("");

      autoBalanceTeams(players);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  }

  function autoBalanceTeams(players) {
    if (!players || !players.length) return;
    const midpoint = Math.ceil(players.length / 2);
    const teamA = players.slice(0, midpoint);
    const teamB = players.slice(midpoint);
    renderTeams(teamA, teamB);
    if (teamBalancerLink) teamBalancerLink.style.display = "inline-block";
  }

  function renderTeams(teamA, teamB) {
    teamResults.innerHTML = `
      <div class="team">
        <h3>Team A</h3>
        <ul>${teamA.map((p) => `<li>${p.name}</li>`).join("")}</ul>
      </div>
      <div class="team">
        <h3>Team B</h3>
        <ul>${teamB.map((p) => `<li>${p.name}</li>`).join("")}</ul>
      </div>
    `;
  }
});
