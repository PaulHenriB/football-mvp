let matchStartTime = null;
let timerInterval = null;
let scoreA = 0, scoreB = 0;
let refereeAssigned = false;
let matchId = 1;  // Assuming matchId comes from the backend session

// Authenticate user (referee) before accessing the match
async function checkRefereeAccess() {
  const response = await fetch(`/api/matches/${matchId}/check-referee`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`  // Assume a token-based system
    }
  });

  if (response.ok) {
    const matchData = await response.json();
    if (matchData.refereeAssigned) {
      refereeAssigned = true;
    } else {
      alert("You are not assigned as the referee for this match.");
      window.location.href = 'login.html';  // Redirect to login if not assigned
    }
  } else {
    alert("Failed to verify your access. Please log in again.");
    window.location.href = 'login.html';
  }
}

async function submitMatchResult() {
  const result = { scoreA, scoreB, matchId, timestamp: new Date().toISOString() };

  const response = await fetch(`/api/matches/${matchId}/submit-result`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result)
  });

  if (response.ok) {
    alert("Match result submitted successfully!");
  } else {
    alert("Failed to submit match result. Please try again.");
  }
}

function formatTime(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startMatch() {
  matchStartTime = new Date();
  timerInterval = setInterval(() => {
    const now = new Date();
    const elapsed = Math.floor((now - matchStartTime) / 1000);
    document.getElementById('timer').textContent = formatTime(elapsed);
  }, 1000);
}

document.getElementById('start-btn').addEventListener('click', startMatch);

function renderPlayers(team, listId, teamName) {
  const list = document.getElementById(listId);
  team.forEach(player => {
    const li = document.createElement('li');
    li.textContent = player;
    li.onclick = () => recordGoal(player, teamName);
    list.appendChild(li);
  });
}

function updateScoreboard() {
  document.getElementById('scoreA').textContent = scoreA;
  document.getElementById('scoreB').textContent = scoreB;
}

function recordGoal(player, team) {
  const timestamp = new Date().toISOString();
  fetch(`/api/matches/${matchId}/record-goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player, team, timestamp })
  });

  if (team === 'A') scoreA++;
  else scoreB++;

  updateScoreboard();
  document.getElementById('submit-result').disabled = false;  // Enable submit button after recording a goal
}

renderPlayers(["Alice", "Bob", "Charlie"], 'teamA-list', 'A');
renderPlayers(["Dan", "Eve", "Frank"], 'teamB-list', 'B');

// Initialize and check referee access on load
checkRefereeAccess();
document.getElementById('submit-result').addEventListener('click', submitMatchResult);
