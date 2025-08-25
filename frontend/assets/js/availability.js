import { showModal, hideModal, confirmModal } from './modal.js';

document.addEventListener("DOMContentLoaded", () => {
  const availabilityList = document.getElementById("availability-list");
  const positionFilter = document.getElementById("position-filter");
  let matches = [];

  async function fetchMatches() {
    try {
      const response = await fetch("/api/matches");
      if (!response.ok) throw new Error("Failed to fetch matches");
      matches = await response.json();
      renderAvailability();
    } catch (error) {
      console.error("Error fetching matches:", error);
    }
  }

  function renderAvailability() {
    availabilityList.innerHTML = "";

    matches.forEach((match, index) => {
      const listItem = document.createElement("li");
      listItem.className = "match-item flex justify-between items-center border-b p-4";

      const status = match.confirmed === true
        ? "<span class='status yes text-green-600 font-semibold'>✔️ Yes</span>"
        : match.confirmed === false
        ? "<span class='status no text-red-600 font-semibold'>❌ No</span>"
        : "<span class='status text-gray-500'>⏳ Pending</span>";

      listItem.innerHTML = `
        <div>
          <strong class="text-lg">${match.title}</strong>
          <p class="text-sm text-gray-500">Position: ${match.position || 'N/A'}</p>
        </div>
        <div class="flex gap-3">
          <button class="yes-btn bg-green-500 text-white px-3 py-1 rounded" data-index="${index}">Yes</button>
          <button class="no-btn bg-red-500 text-white px-3 py-1 rounded" data-index="${index}">No</button>
        </div>
        <div>${status}</div>
      `;

      availabilityList.appendChild(listItem);
    });

    attachButtonListeners();
  }

  function attachButtonListeners() {
    document.querySelectorAll(".yes-btn").forEach(button =>
      button.addEventListener("click", async (e) => {
        const index = e.target.getAttribute("data-index");
        await updateAvailability(matches[index].id, true);
        await fetchMatches();
      })
    );

    document.querySelectorAll(".no-btn").forEach(button =>
      button.addEventListener("click", async (e) => {
        const index = e.target.getAttribute("data-index");
        const confirmed = await confirmModal("Are you sure you want to mark as unavailable?");
        if (confirmed) {
          await updateAvailability(matches[index].id, false);
          await fetchMatches();
        }
      })
    );
  }

  async function updateAvailability(matchId, confirmed) {
    try {
      const response = await fetch(`/api/players/available`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, confirmed })
      });
      if (!response.ok) throw new Error("Failed to update availability");
      showToast("Availability updated!");
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("opacity-0", "pointer-events-none");
    toast.classList.add("opacity-100");
    setTimeout(() => {
      toast.classList.add("opacity-0", "pointer-events-none");
    }, 3000);
  }

  fetchMatches(); // initial call
});
