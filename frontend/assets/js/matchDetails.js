document.addEventListener("DOMContentLoaded", () => {
    // Handle rating changes
    const ratingSelects = document.querySelectorAll(".rating-select");
  
    ratingSelects.forEach(select => {
      select.addEventListener("change", (event) => {
        const playerId = event.target.dataset.playerId;
        const ratingValue = event.target.value;
  
        if (ratingValue) {
          updatePlayerRating(playerId, ratingValue);
        }
      });
    });
  
    // Handle match status update
    const matchStatus = document.getElementById("match-status");
    const updateStatusBtn = document.getElementById("update-status-btn");
  
    if (updateStatusBtn) {
      updateStatusBtn.addEventListener("click", () => {
        const newStatus = prompt("Enter new match status (e.g., Scheduled, In Progress, Completed):");
        if (newStatus) {
          matchStatus.textContent = newStatus;
          // Later: Send to backend to update in database
        }
      });
    }
  
    // Simulated rating update (local display only)
    function updatePlayerRating(playerId, ratingValue) {
      const ratingDisplay = document.getElementById(`player-rating-${playerId}`);
      if (ratingDisplay) {
        ratingDisplay.textContent = `Rating: ${ratingValue}/5`;
      }
      // Later: Send to backend to persist rating
    }
  });
  