import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const container = document.getElementById("matches-list");
  const filterSelect = document.getElementById("match-filter");

  const loadMatches = async (filter) => {
    try {
      const matches = await apiRequest(API_ENDPOINTS.MATCHES, { method: "GET" });
      const now = new Date();

      const filtered = matches.filter(m => {
        const matchDate = new Date(m.date);
        return filter === "upcoming" ? matchDate >= now : matchDate < now;
      });

      container.innerHTML = filtered.map(m => {
        if (filter === "upcoming") {
          return `
            <div class="match upcoming">
              <p><strong>Date:</strong> ${m.date}</p>
              <p><strong>Time:</strong> ${m.time || "TBD"}</p>
              <p><strong>Team:</strong> ${m.userTeam || "TBD"}</p>
              <p><strong>Venue:</strong> ${m.venue || "TBD"}</p>
              <a href="matchdetails.html?id=${m.id}">View Details</a>
            </div>
          `;
        } else {
          return `
            <div class="match past">
              <p><strong>Date:</strong> ${m.date}</p>
              <p><strong>Team:</strong> ${m.userTeam || "TBD"}</p>
              <p><strong>Result:</strong> ${m.result || "TBD"}</p>
              <a href="matchdetails.html?id=${m.id}">View Details</a>
            </div>
          `;
        }
      }).join("");

    } catch (err) {
      console.error("Error loading matches:", err);
      container.innerHTML = "<p>Error loading matches.</p>";
    }
  };

  // Initial load
  loadMatches(filterSelect.value);

  // Update on filter change
  filterSelect.addEventListener('change', () => loadMatches(filterSelect.value));
});
