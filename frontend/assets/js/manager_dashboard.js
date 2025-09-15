// frontend/assets/js/manager_dashboard.js
import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const matchForm = document.getElementById("match-form");
  const upcomingList = document.getElementById("upcoming-list");
  const pastList = document.getElementById("past-list");
  const playerList = document.getElementById("player-list");
  const teamResults = document.getElementById("team-results");
  const teamBalancerLink = document.getElementById("team-balancer-link");

  // Fetch initial data
  await fetchMatches();
  await fetchPlayers();

  /** Handle match scheduling */
  matchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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
      alert("✅ Match scheduled successfully!");
      matchForm.reset();
      await fetchMatches();
    } catch (err) {
      console.error("Error scheduling match:", err);
      alert("❌ Failed to schedule match. Please try again.");
    }
  });

  /** Fetch and render matches */
  async function fetchMatches() {
    try {
      const matches = await apiRequest(API_ENDPOINTS.MATCHES, { method: "GET" });

      upcomingList.innerHTML = "";
      pastList.innerHTML = "";

      const now = new Date();

      matches.forEach((match) => {
        const matchDate = new Date(`${match.date}T${match.time}`);

        const matchEl = document.createElement("div");
        matchEl.classList.add("match"); // aligns with .match-list .match in CSS
        matchEl.innerHTML = `
          <div class="time">${match.time}</div>
          <div class="meta">
            <p><strong>${match.date}</strong> – ${match.location}</p>
            <p>⏱ ${match.duration} min • 👥 ${match.numberOfPlayers} players (Spots: ${match.availableSpots})</p>
            <span class="badge ${matchDate > now ? "badge--yellow" : "badge--green"}">
              ${matchDate > now ? "Upcoming" : "Finished"}
            </span>
            <h4>Registered Players:</h4>
            <ul>${match.players.map(p => `<li>${p.name}</li>`).join("")}</ul>
          </div>
        `;

        if (matchDate > now) {
          upcomingList.appendChild(matchEl);
        } else {
          pastList.appendChild(matchEl);
        }
      });
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
  }

  /** Fetch and render players */
  async function fetchPlayers() {
    try {
      const players = await apiRequest(API_ENDPOINTS.PLAYERS, { method: "GET" });
      playerList.innerHTML = players
        .map(p => `<li>${p.name} (${p.position || "No position"})</li>`)
        .join("");

      // Auto-balance when players are fetched
      autoBalanceTeams(players);
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  }

  /** Simple auto-balance into 2 teams */
  function autoBalanceTeams(players) {
    if (!players.length) return;

    const midpoint = Math.ceil(players.length / 2);
    const teamA = players.slice(0, midpoint);
    const teamB = players.slice(midpoint);

    renderTeams(teamA, teamB);
    teamBalancerLink.style.display = "inline-block"; // show link to team-balancer.html
  }

  /** Render teams in dashboard */
  function renderTeams(teamA, teamB) {
    teamResults.innerHTML = `
      <div class="team">
        <h3>Team A</h3>
        <ul>${teamA.map(p => `<li>${p.name}</li>`).join("")}</ul>
      </div>
      <div class="team">
        <h3>Team B</h3>
        <ul>${teamB.map(p => `<li>${p.name}</li>`).join("")}</ul>
      </div>
    `;
  }
});
