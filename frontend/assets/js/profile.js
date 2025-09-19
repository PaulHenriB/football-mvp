import { enforceAuth } from "./auth-guard.js";
import { apiFetch, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const form = document.getElementById("profile-form");
  const availabilityContainer = document.getElementById("availability");
  const availabilityForm = document.getElementById("availability-form");
  const ratingsContainer = document.getElementById("ratings-summary");
  const ratingsHistory = document.getElementById("ratings-history");

  // NEW: containers for matches
  const upcomingMatchesContainer = document.getElementById("player-upcoming-matches");
  const registeredMatchesContainer = document.getElementById("player-registered-matches");
  const pastMatchesContainer = document.getElementById("player-past-matches");

  let user;

  try {
    user = await apiFetch(API_ENDPOINTS.ME, { method: "GET" });

    // Pre-fill profile
    form.firstName.value = user.firstName || "";
    form.lastName.value = user.lastName || "";
    form.dob.value = user.dob || "";
    form.favoriteFoot.value = user.favoriteFoot || "left";
    form.favoritePosition.value = user.favoritePosition || "GK";

    // Load availability
    renderAvailability(user.availability || []);

    // Load ratings
    await loadRatings(user.id);

    // Load player matches
    await loadPlayerMatches(user.id);
  } catch (err) {
    console.error("Error loading profile:", err);
    form.innerHTML = "<p class='error'>Error loading profile.</p>";
  }

  // Handle profile update
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedData = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      dob: form.dob.value,
      favoriteFoot: form.favoriteFoot.value,
      favoritePosition: form.favoritePosition.value,
    };

    try {
      await apiFetch(API_ENDPOINTS.UPDATE_ME, {
        method: "PUT",
        body: JSON.stringify(updatedData),
        headers: { "Content-Type": "application/json" },
      });
      alert("✅ Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Failed to update profile.");
    }
  });

  // Handle availability update
  availabilityForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newAvailability = {
      date: availabilityForm.date.value,
      status: availabilityForm.status.value,
    };

    try {
      await apiFetch(API_ENDPOINTS.AVAILABILITY, {
        method: "POST",
        body: JSON.stringify(newAvailability),
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Availability updated.");
      const refreshedUser = await apiFetch(API_ENDPOINTS.ME, { method: "GET" });
      renderAvailability(refreshedUser.availability || []);
    } catch (err) {
      console.error("Error updating availability:", err);
      alert("❌ Failed to update availability.");
    }
  });

  // ============================
  // Matches for this player
  // ============================
  async function loadPlayerMatches(playerId) {
    try {
      // Upcoming matches (player can still join)
      const upcoming = await apiFetch(API_ENDPOINTS.PLAYER_UPCOMING_MATCHES(playerId));
      renderMatches(upcomingMatchesContainer, upcoming, { allowJoin: true });

      // Registered matches (future matches already joined)
      const registered = await apiFetch(API_ENDPOINTS.PLAYER_REGISTERED_MATCHES(playerId));
      renderMatches(registeredMatchesContainer, registered);

      // Past matches (played matches)
      const past = await apiFetch(API_ENDPOINTS.PLAYER_PAST_MATCHES(playerId));
      renderMatches(pastMatchesContainer, past);
    } catch (err) {
      console.error("Error loading player matches:", err);
      upcomingMatchesContainer.innerHTML = "<p class='error'>Failed to load matches.</p>";
      registeredMatchesContainer.innerHTML = "<p class='error'>Failed to load matches.</p>";
      pastMatchesContainer.innerHTML = "<p class='error'>Failed to load matches.</p>";
    }
  }

  function renderMatches(container, matches, options = {}) {
    container.innerHTML = "";

    if (!matches || matches.length === 0) {
      container.innerHTML = "<p>No matches found.</p>";
      return;
    }

    const list = document.createElement("ul");
    matches.forEach(match => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${match.title}</strong> - ${new Date(match.date).toLocaleString()}
        ${options.allowJoin ? `<button class="btn primary-btn join-btn" data-id="${match.id}">Join</button>` : ""}
      `;
      list.appendChild(li);
    });
    container.appendChild(list);

    if (options.allowJoin) {
      container.querySelectorAll(".join-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const matchId = btn.dataset.id;
          try {
            await apiFetch(API_ENDPOINTS.JOIN_MATCH(matchId), { method: "POST" });
            alert("✅ Joined match successfully.");
            await loadPlayerMatches(user.id); // refresh lists
          } catch (err) {
            console.error("Error joining match:", err);
            alert("❌ Failed to join match.");
          }
        });
      });
    }
  }

  // ============================
  // Helpers
  // ============================

  function renderAvailability(availability) {
    availabilityContainer.innerHTML = availability.length
      ? `<ul>${availability
          .map((a) => `<li><strong>${a.date}</strong>: ${a.status}</li>`)
          .join("")}</ul>`
      : "<p>No availability set.</p>";
  }

  async function loadRatings(playerId) {
    try {
      const ratings = await apiFetch(`${API_ENDPOINTS.PLAYERS}/${playerId}/ratings`, { method: "GET" });

      if (ratings && ratings.length > 0) {
        const avg = (
          ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        ).toFixed(2);

        ratingsContainer.innerHTML = `
          <p><strong>Average Rating:</strong> ${avg}/10</p>
          <div class="stars" data-rating="${(avg / 2).toFixed(1)}"></div>
          <div class="progress-bar"><div style="width: ${(avg / 10) * 100}%"></div></div>
        `;

        ratingsHistory.innerHTML = ratings
          .map(
            (r) => `
            <div class="rating-entry">
              <p>Match ${r.matchId} <em>(${new Date(r.createdAt).toLocaleDateString()})</em></p>
              <div class="stars" data-rating="${(r.score / 2).toFixed(1)}"></div>
              <div class="progress-bar"><div style="width: ${(r.score / 10) * 100}%"></div></div>
              ${r.comment ? `<p class="rating-comment">"${r.comment}"</p>` : ""}
            </div>
          `
          )
          .join("");

        applyStarRatings();
      } else {
        ratingsContainer.innerHTML = "<p>No ratings yet.</p>";
        ratingsHistory.innerHTML = "";
      }
    } catch (err) {
      console.error("Error loading ratings:", err);
      ratingsContainer.innerHTML = "<p class='error'>Failed to load ratings.</p>";
    }
  }

  function applyStarRatings() {
    document.querySelectorAll(".stars").forEach((starEl) => {
      const rating = parseFloat(starEl.dataset.rating) || 0;
      starEl.style.setProperty("--rating", rating);
    });
  }
});
