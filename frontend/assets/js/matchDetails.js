import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const matchId = getQueryParam("id");
  if (!matchId) return;

  const matchContainer = document.getElementById("match-details");
  const resultFormSection = document.getElementById("result-form-section");
  const ratingSection = document.getElementById("rating-section");
  const ratingList = document.getElementById("rating-list");

  try {
    const match = await apiRequest(API_ENDPOINTS.MATCH_BY_ID(matchId), { method: "GET" });
    const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });

    // Render basic match info
    matchContainer.insertAdjacentHTML("afterbegin", `
      <h2>${match.name}</h2>
      <p>Date: ${match.date}</p>
      <p>Location: ${match.location}</p>
      <p>Status: ${match.status}</p>
    `);

    // If match not finished → manager can record result
    if (match.status !== "FINISHED") {
      if (user.id === match.managerId) {
        resultFormSection.style.display = "block";
        setupResultForm(matchId);
      }
    }

    // If match finished → players can rate opponents
    if (match.status === "FINISHED") {
      ratingSection.style.display = "block";
      const opponents = match.players.filter(p => p.id !== user.id);
      opponents.forEach(p => {
        ratingList.insertAdjacentHTML("beforeend", `
          <div class="rating-item">
            <p>${p.name}</p>
            <label>Score (0–10):
              <input type="number" name="score-${p.id}" min="0" max="10" required>
            </label>
            <label>Comment:
              <input type="text" name="comment-${p.id}">
            </label>
          </div>
        `);
      });
      setupRatingForm(matchId, opponents);
    }

  } catch (err) {
    console.error("Error loading match:", err);
    matchContainer.innerHTML = "<p>Error loading match details.</p>";
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
      alert("Result recorded successfully.");
      location.reload();
    } catch (err) {
      console.error("Error submitting result:", err);
      alert("Failed to record result.");
    }
  });
}

function setupRatingForm(matchId, opponents) {
  const form = document.getElementById("rating-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      for (let opponent of opponents) {
        const score = form.querySelector(`[name="score-${opponent.id}"]`).value;
        const comment = form.querySelector(`[name="comment-${opponent.id}"]`).value;
        
        await apiRequest(API_ENDPOINTS.MATCH_RATE(matchId), {
          method: "POST",
          body: JSON.stringify({
            opponentId: opponent.id,
            score,
            comment
          })
        });
      }
      alert("Ratings submitted successfully.");
      form.querySelectorAll("input, button").forEach(el => el.disabled = true);
    } catch (err) {
      console.error("Error submitting ratings:", err);
      alert("Failed to submit ratings.");
    }
  });
}
