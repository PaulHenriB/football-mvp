import { enforceAuth } from "./auth-guard.js";
import { apiFetch, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const form = document.getElementById("profile-form");
  const availabilityContainer = document.getElementById("availability");
  const availabilityForm = document.getElementById("availability-form");
  const ratingsContainer = document.getElementById("ratings-summary");
  const ratingsHistory = document.getElementById("ratings-history");

  // Containers for matches (aligned with profile.html)
  const openMatchesContainer = document.getElementById("player-open-matches");
  const upcomingMatchesContainer = document.getElementById("player-upcoming-matches");
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

    // Load matches
    await loadPlayerMatches(user.id);
  } catch (err) {
    console.error("Error loading profile:", err);
    form.innerHTML = "<p class='error'>Error loading profile.</p>";
  }

  // ============================
  // Profile update
  // ============================
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
      });
      alert("✅ Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Failed to update profile.");
    }
  });

  // ============================
  // Availability
  // ============================
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
      });

      alert("✅ Availability updated.");
      const refreshedUser = await apiFetch(API_ENDPOINTS.ME, { method: "GET" });
      renderAvailability(refreshedUser.availability || []);
    } catch (err) {
      console.error("Error updating availability:", err);
      alert("❌ Failed to update availability.");
    }
  });

  function renderAvailability(availability) {
    availabilityContainer.innerHTML = availability.length
      ? `<ul>${availability
          .map((a) => `<li><strong>${a.date}</strong>: ${a.status}</li>`)
          .join("")}</ul>`
      : "<p>No availability set.</p>";
  }

  // ============================
  // Matches (open, upcoming, past)
  // ============================
  async function loadPlayerMatches(playerId) {
    try {
      // Open matches (joinable)
      const openMatches = await apiFetch(API_ENDPOINTS.OPEN_MATCHES);
      renderMatches(openMatchesContainer, openMatches, { allowJoin: true });

      // Upcoming matches (already registered)
      const upcoming = await apiFetch(API_ENDPOINTS.UPCOMING_MATCHES);
      const upcomingForPlayer = upcoming.filter(m =>
        m.players?.some(p => p.id === playerId)
      );
      renderMatches(upcomingMatchesContainer, upcomingForPlayer);

      // Past matches (only those player took part in)
      const past = await apiFetch(API_ENDPOINTS.PAST_MATCHES);
      const pastForPlayer = past.filter(m =>
        m.players?.some(p => p.id === playerId)
      );
      renderMatches(pastMatchesContainer, pastForPlayer);
    } catch (err) {
      console.error("Error loading player matches:", err);
      openMatchesContainer.innerHTML = "<p class='error'>Failed to load open matches.</p>";
      upcomingMatchesContainer.innerHTML = "<p class='error'>Failed to load upcoming matches.</p>";
      pastMatchesContainer.innerHTML = "<p class='error'>Failed to load past matches.</p>";
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
        <strong>${match.title || "Unnamed Match"}</strong> - ${new Date(match.date).toLocaleString()}
        ${options.allowJoin ? `<button class="btn primary-btn join-btn" data-id="${match.id}">Join</button>` : ""}
      `;
      list.appendChild(li);
    });
    container.appendChild(list);

    // Join match logic
    if (options.allowJoin) {
      container.querySelectorAll(".join-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const matchId = btn.dataset.id;
          try {
            await apiFetch(`${API_ENDPOINTS.JOIN_MATCH}/${matchId}`, { method: "POST" });
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
  // Ratings
  // ============================
  async function loadRatings(playerId) {
    try {
      const ratings = await apiFetch(`${API_ENDPOINTS.PLAYERS}/${playerId}/ratings`);

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

