import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const form = document.getElementById("profile-form");
  const availabilityContainer = document.getElementById("availability");
  const availabilityForm = document.getElementById("availability-form");
  const ratingsContainer = document.getElementById("ratings-summary");
  const ratingsHistory = document.getElementById("ratings-history");
  const quickAccess = document.getElementById("quick-access");
  const managerLink = document.getElementById("manager-link");

  let user;

  try {
    user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });

    // Role-based visibility
    if (user.role === "MANAGER") {
      quickAccess.style.display = "block";
      managerLink.style.display = "inline-block";
    }

    // Pre-fill form
    form.firstName.value = user.firstName || "";
    form.lastName.value = user.lastName || "";
    form.dob.value = user.dob || "";
    form.favoriteFoot.value = user.favoriteFoot || "left";
    form.favoritePosition.value = user.favoritePosition || "GK";

    // Load availability
    renderAvailability(user.availability || []);

    // Load ratings
    const ratings = await apiRequest(
      `${API_ENDPOINTS.PLAYERS}/${user.id}/ratings`,
      { method: "GET" }
    );

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
    console.error("Error loading profile:", err);
    form.innerHTML = "<p>Error loading profile.</p>";
  }

  // Profile update
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
      await apiRequest(API_ENDPOINTS.UPDATE_ME, {
        method: "PUT",
        body: JSON.stringify(updatedData),
        headers: { "Content-Type": "application/json" },
      });
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  });

  // Availability update
  availabilityForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newAvailability = {
      date: availabilityForm.date.value,
      status: availabilityForm.status.value,
    };

    try {
      await apiRequest(API_ENDPOINTS.AVAILABILITY, {
        method: "POST",
        body: JSON.stringify(newAvailability),
        headers: { "Content-Type": "application/json" },
      });

      alert("Availability updated.");
      const refreshedUser = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });
      renderAvailability(refreshedUser.availability || []);
    } catch (err) {
      console.error("Error updating availability:", err);
      alert("Failed to update availability.");
    }
  });

  // Helpers
  function renderAvailability(availability) {
    availabilityContainer.innerHTML = availability.length
      ? `<ul>${availability
          .map((a) => `<li><strong>${a.date}</strong>: ${a.status}</li>`)
          .join("")}</ul>`
      : "<p>No availability set.</p>";
  }

  function applyStarRatings() {
    document.querySelectorAll(".stars").forEach((starEl) => {
      const rating = parseFloat(starEl.dataset.rating) || 0;
      starEl.style.setProperty("--rating", rating);
    });
  }
});

