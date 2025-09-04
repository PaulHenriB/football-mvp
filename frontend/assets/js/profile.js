import { enforceAuth } from "./auth-guard.js";
import { apiRequest, API_ENDPOINTS } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await enforceAuth();

  const form = document.getElementById("profile-form");
  const availabilityContainer = document.getElementById("availability");
  const ratingsContainer = document.getElementById("ratings");

  try {
    const user = await apiRequest(API_ENDPOINTS.ME, { method: "GET" });

    // Pre-fill form fields with user data
    form.firstName.value = user.firstName || "";
    form.lastName.value = user.lastName || "";
    form.dob.value = user.dob || "";
    form.favoriteFoot.value = user.favoriteFoot || "left";
    form.favoritePosition.value = user.favoritePosition || "GK";

    // Load user availability
    const availability = user.availability || [];
    availabilityContainer.innerHTML = availability.length
      ? `<ul>${availability.map(a => `<li>${a.date}: ${a.status}</li>`).join('')}</ul>`
      : '<p>No availability set.</p>';

    // Load user ratings
    const ratings = await apiRequest(`${API_ENDPOINTS.PLAYERS}/${user.id}/ratings`, { method: "GET" });
    if (ratings && ratings.length > 0) {
      const avg = (
        ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      ).toFixed(2);
      ratingsContainer.innerHTML = `
        <p><strong>Average Rating:</strong> ${avg}/10</p>
        <ul>
          ${ratings.map(r => `
            <li>
              Match ${r.matchId}: ${r.score}/10
              ${r.comment ? ` - ${r.comment}` : ""}
              <em>(${new Date(r.createdAt).toLocaleDateString()})</em>
            </li>
          `).join("")}
        </ul>
      `;
    } else {
      ratingsContainer.innerHTML = '<p>No ratings yet.</p>';
    }

  } catch (err) {
    console.error("Error loading profile:", err);
    form.innerHTML = "<p>Error loading profile.</p>";
  }

  // Handle profile form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updatedData = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      dob: form.dob.value,
      favoriteFoot: form.favoriteFoot.value,
      favoritePosition: form.favoritePosition.value
    };

    try {
      await apiRequest(API_ENDPOINTS.UPDATE_ME, {
        method: "PUT",
        body: JSON.stringify(updatedData),
        headers: { 'Content-Type': 'application/json' }
      });
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile.");
    }
  });
});
