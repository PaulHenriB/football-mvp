// script.js

/**
 * Load and display applicants for a given match
 */
async function loadApplicants(matchId) {
  try {
    const res = await fetch(`/api/matches/${matchId}/applicants`);
    const applicants = await res.json();

    const container = document.getElementById('applicants');
    container.innerHTML = applicants.map(p => `
      <div class="applicant-card">
        <span>${p.name}</span>
        <button onclick="respond(${matchId}, ${p.id}, 'approved')" class="btn-approve">Approve</button>
        <button onclick="respond(${matchId}, ${p.id}, 'rejected')" class="btn-reject">Reject</button>
      </div>
    `).join('');
  } catch (error) {
    console.error("Failed to load applicants:", error);
  }
}

/**
 * Handle approval or rejection of an applicant
 */
async function respond(matchId, playerId, status) {
  try {
    await fetch(`/api/open-matches/${matchId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player_id: playerId, status })
    });

    loadApplicants(matchId);
  } catch (error) {
    console.error("Error submitting response:", error);
  }
}
