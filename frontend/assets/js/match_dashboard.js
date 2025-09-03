import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const matchForm = document.getElementById("match-form");
  const upcomingList = document.getElementById("upcoming-list");
  const pastList = document.getElementById("past-list");
  const playerList = document.getElementById("player-list");
  const balanceBtn = document.getElementById("balance-teams");
  const teamResults = document.getElementById("team-results");

  // Fetch and render matches on load
  await fetchMatches();
  await fetchPlayers();

  // Handle match scheduling
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
      alert("Match scheduled successfully!");
      matchForm.reset();
      await fetchMatches();
    } catch (err) {
      console.error("Error scheduling match:", err);
      alert("Failed to schedule match. Please try again.");
    }
  });

  // Handle team balancing
  balanceBtn.addEventListener("click", async () => {
    try {
      const players = await apiRequest(API_ENDPOINTS.PLAYERS, { method: "GET" });
      // Dummy auto-balancing (split into 2 teams)
      const midpoint = Math.ceil(players.length / 2);
      const teamA = players.slice(0, midpoint);
      const teamB = players.slice(midpoint);

      renderTeams(teamA, teamB);
    } catch (err) {
      console.error("Error balancing teams:", err);
    }
  });

  async function fetchMatches() {
    try {
      const matches = await apiRequest(API_ENDPOINTS.MATCHES, { method: "GET" });

      upcomingList.innerHTML = "";
      pastList.innerHTML = "";

      const now = new Date();

      matches.forEach((match) => {
        const matchDate = new Date(`${match.date}T${match.time}`);
        const matchEl = document.createElement("div");
        matchEl.classList.add("match-card");
        matchEl.innerHTML = `
          <h3>${match.date} ${match.time}</h3>
          <p>Location: ${match.location}</p>
          <p>Duration: ${match.duration} min</p>
          <p>Players: ${match.numberOfPlayers} (Spots: ${match.availableSpots})</p>
          <h4>Registered Players:</h4>
          <ul>${match.players.map(p => `<li>${p.name}</li>`).join("")}</ul>
          <p>Teams can be managed in <a href="team-balancer.html">Team Balancer</a></p>
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

  async function fetchPlayers() {
    try {
      const players = await apiRequest(API_ENDPOINTS.PLAYERS, { method: "GET" });
      playerList.innerHTML = players.map(p => `<li>${p.name} (${p.position || "No position"})</li>`).join("");
    } catch (err) {
      console.error("Error fetching players:", err);
    }
  }

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
