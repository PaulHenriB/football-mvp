async function searchMatches() {
  const city = document.getElementById('city').value.trim();
  const date = document.getElementById('date').value;
  const container = document.getElementById('match-results');

  // Input validation
  if (!city || !date) {
    container.innerHTML = `<p class="error">Please enter both city and date.</p>`;
    return;
  }

  // Show loading message
  container.innerHTML = `<p>🔍 Searching for matches in ${city} on ${date}...</p>`;

  try {
    const res = await fetch(`/api/open-matches/search?city=${city}&date=${date}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to fetch matches');
    }

    if (!data.matches || data.matches.length === 0) {
      container.innerHTML = `<p>No matches found for your search.</p>`;
      return;
    }

    // Render results
    container.innerHTML = data.matches.map(m => `
      <div class="match-card">
        <h3>${formatDate(m.dateTime)} - ${m.matchType}</h3>
        <p><strong>Location:</strong> ${m.location}</p>
        <p><strong>Max Players:</strong> ${m.maxPlayers}</p>
        <p><strong>Notes:</strong> ${m.notes || 'N/A'}</p>
        <button onclick="applyToMatch(${m.id}, this)">Apply to Play</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
    container.innerHTML = `<p class="error">❌ ${error.message}</p>`;
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

async function applyToMatch(matchId, button) {
  const playerId = localStorage.getItem('userId');
  if (!playerId) {
    alert('You must be logged in to apply for a match.');
    return;
  }

  try {
    button.disabled = true;
    button.textContent = 'Applying...';

    const res = await fetch(`/api/open-matches/${matchId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId })
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error || 'Could not apply to the match.');
    }

    alert('✅ Application sent!');
    button.textContent = 'Applied';
  } catch (error) {
    console.error('Apply error:', error);
    alert(`❌ Error: ${error.message}`);
    button.disabled = false;
    button.textContent = 'Apply to Play';
  }
}
