document.addEventListener('DOMContentLoaded', () => {
    const matchId = getMatchIdFromURL();
    loadPlayers(matchId);
  
    const form = document.getElementById('rating-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRatings(matchId);
    });
  });
  
  function getMatchIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('matchId');
  }
  
  async function loadPlayers(matchId) {
    try {
      const res = await fetch(`/api/matches/${matchId}/players`);
      const players = await res.json();
      const playersList = document.getElementById('players-list');
      playersList.innerHTML = '';
  
      players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-rating-card';
        playerCard.innerHTML = `
          <h3>${player.name}</h3>
          <label for="rating-${index}">Rating:</label>
          <input type="range" id="rating-${index}" name="rating-${index}" min="0" max="10" step="1" value="5"
                 oninput="document.getElementById('rating-display-${index}').textContent = this.value" />
          <span id="rating-display-${index}">5</span>
          <br/>
          <label for="comment-${index}">Comment:</label>
          <textarea id="comment-${index}" name="comment-${index}" rows="2" placeholder="Optional feedback..."></textarea>
          <input type="hidden" name="playerId" value="${player.id}" />
        `;
        playersList.appendChild(playerCard);
      });
  
    } catch (error) {
      console.error('Failed to load players:', error);
    }
  }
  
  async function submitRatings(matchId) {
    const form = document.getElementById('rating-form');
    const ratingCards = document.querySelectorAll('.player-rating-card');
    const ratings = [];
  
    ratingCards.forEach((card) => {
      const playerId = card.querySelector('input[name="playerId"]').value;
      const rating = card.querySelector(`input[type="range"]`).value;
      const comment = card.querySelector(`textarea`).value;
  
      ratings.push({
        player_id: playerId,
        match_id: matchId,
        rating: parseInt(rating, 10),
        comment: comment.trim()
      });
    });
  
    try {
      const res = await fetch('/api/ratings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings })
      });
  
      if (res.ok) {
        showToast('Ratings submitted successfully!');
  
        // Optionally disable submit button
        document.querySelector('.submit-btn').disabled = true;
  
        // Optionally reset the form
        form.reset();
  
        // Optional redirect after 3 seconds (adjust URL as needed)
        setTimeout(() => {
          window.location.href = '/dashboard.html'; // 👈 Change to your desired page
        }, 3000);
  
      } else {
        console.error('Rating submission failed:', await res.text());
        showToast('Something went wrong. Please try again.', true);
      }
    } catch (error) {
      console.error('Error submitting ratings:', error);
      showToast('Network error. Please try again later.', true);
    }
  }
  
  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : 'success'}`;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 100); // Fade in
  
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); // Fade out and remove
  }
  