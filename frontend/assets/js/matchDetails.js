import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const matchId = getQueryParam("id");
  if (!matchId) return;

  const matchDate = document.getElementById("match-date");
  const matchLocation = document.getElementById("match-location");
  const matchTeams = document.getElementById("match-teams");
  const matchStatus = document.getElementById("match-status");

  const resultFormSection = document.getElementById("result-form-section");
  const ratingSection = document.getElementById("rating-section");
  const ratingList = document.getElementById("rating-list");

  try {
    const match = await apiRequest(API_ENDPOINTS.MATCH_BY_ID(matchId), { method: "GET" });
    const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });

    // ✅ Populate placeholders
    matchDate.textContent = match.date;
    matchLocation.textContent = match.location;
    matchTeams.textContent = match.teams || `${match.homeTeam} vs ${match.awayTeam}`;
    matchStatus.textContent = match.status;

    // ✅ Manager: show result form if match not finished
    if (match.status !== "FINISHED" && user.id === match.managerId) {
      resultFormSection.classList.remove("hidden");
      setupResultForm(matchId);
    }

    // ✅ Player: show rating form if match finished
    if (match.status === "FINISHED") {
      ratingSection.classList.remove("hidden");

      const opponents = match.players.filter(p => p.id !== user.id);
      opponents.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("rating-item");
        div.innerHTML = `
          <p>${p.name} (${p.position})</p>
          <div class="rating-stars" data-player-id="${p.id}">
            ${[1, 2, 3, 4, 5].map(i => `<span data-value="${i}">★</span>`).join("")}
          </div>
        `;
        ratingList.appendChild(div);
      });

      setupStarRating();
      setupRatingForm(matchId, opponents);
    }
  } catch (err) {
    console.error("Error loading match:", err);
    document.getElementById("match-details").innerHTML = "<p>Error loading match details.</p>";
  }
});

function setupResultForm(matchId) {
  const form = document.getElementById("result-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const homeScore = document.getElementById("homeScore").value;
    const awayScore = document.getElementById("awayScore").value;

    try {
      await apiRequest(API_ENDPOINTS.MATCH_RESULT(matchId), {
        method: "PUT",
        body: JSON.stringify({ homeScore, awayScore })
      });
      alert("✅ Result recorded successfully.");
      location.reload();
    } catch (err) {
      console.error("Error submitting result:", err);
      alert("❌ Failed to record result.");
    }
  });
}

function setupStarRating() {
  document.querySelectorAll(".rating-stars").forEach(container => {
    container.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        const value = parseInt(e.target.dataset.value);
        container.querySelectorAll("span").forEach(star => {
          star.classList.toggle("active", parseInt(star.dataset.value) <= value);
        });
        container.dataset.selected = value;
      }
    });
  });
}

function setupRatingForm(matchId, opponents) {
  const form = document.getElementById("rating-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      for (let opponent of opponents) {
        const container = document.querySelector(`.rating-stars[data-player-id="${opponent.id}"]`);
        const score = container.dataset.selected || 0;

        await apiRequest(API_ENDPOINTS.MATCH_RATE(matchId), {
          method: "POST",
          body: JSON.stringify({ opponentId: opponent.id, score })
        });
      }
      alert("⭐ Ratings submitted successfully.");
      form.querySelectorAll("input, button, .rating-stars span").forEach(el => el.disabled = true);
    } catch (err) {
      console.error("Error submitting ratings:", err);
      alert("❌ Failed to submit ratings.");
    }
  });
}
