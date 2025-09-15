document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  document.getElementById("match-select").addEventListener("change", loadTeams);
  document.getElementById("save-teams").addEventListener("click", saveTeams);
});

async function loadMatches() {
  try {
    const res = await fetch("/api/matches");
    const matches = await res.json();
    const select = document.getElementById("match-select");

    matches.forEach(m => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = `${m.date} - ${m.location}`;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading matches:", err);
  }
}

async function loadTeams() {
  const matchId = document.getElementById("match-select").value;
  if (!matchId) return;

  try {
    const res = await fetch(`/api/matches/${matchId}/balanced-teams`);
    const data = await res.json();

    renderTeam("team1-list", data.team1);
    renderTeam("team2-list", data.team2);

    enableDragAndDrop();
  } catch (err) {
    console.error("Error loading teams:", err);
  }
}

function renderTeam(containerId, players) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  players.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name} (${p.position}) - ${p.rating}/10`;
    li.draggable = true;
    li.dataset.playerId = p.id;
    container.appendChild(li);
  });
}

function enableDragAndDrop() {
  const lists = document.querySelectorAll(".team-list");

  lists.forEach(list => {
    list.addEventListener("dragstart", e => {
      if (e.target.tagName === "LI") {
        e.dataTransfer.setData("text/plain", e.target.dataset.playerId);
        e.target.classList.add("dragging");
      }
    });

    list.addEventListener("dragend", e => {
      e.target.classList.remove("dragging");
    });

    list.addEventListener("dragover", e => {
      e.preventDefault();
    });

    list.addEventListener("drop", e => {
      e.preventDefault();
      const playerId = e.dataTransfer.getData("text/plain");
      const draggedEl = document.querySelector(`[data-player-id="${playerId}"]`);
      if (draggedEl && list !== draggedEl.parentNode) {
        list.appendChild(draggedEl);
      }
    });
  });
}

async function saveTeams() {
  const matchId = document.getElementById("match-select").value;
  if (!matchId) return alert("Please select a match first.");

  const team1 = Array.from(document.querySelectorAll("#team1-list li")).map(li => li.dataset.playerId);
  const team2 = Array.from(document.querySelectorAll("#team2-list li")).map(li => li.dataset.playerId);

  try {
    const res = await fetch(`/api/matches/${matchId}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team1, team2 })
    });

    if (res.ok) {
      alert("✅ Teams saved successfully!");
    } else {
      alert("❌ Failed to save teams.");
    }
  } catch (err) {
    console.error("Error saving teams:", err);
    alert("⚠️ Something went wrong while saving.");
  }
}
