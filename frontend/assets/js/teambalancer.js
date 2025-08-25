document.addEventListener("DOMContentLoaded", () => {
    loadMatches();
    document.getElementById("match-select").addEventListener("change", loadTeams);
  });
  
  async function loadMatches() {
    const res = await fetch("/api/matches");
    const matches = await res.json();
    const select = document.getElementById("match-select");
  
    matches.forEach(m => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = `${m.date} - ${m.location}`;
      select.appendChild(option);
    });
  }
  
  async function loadTeams() {
    const matchId = document.getElementById("match-select").value;
    const res = await fetch(`/api/matches/${matchId}/balanced-teams`);
    const data = await res.json();
  
    const team1 = document.getElementById("team-1").querySelector(".team-list");
    const team2 = document.getElementById("team-2").querySelector(".team-list");
  
    team1.innerHTML = "";
    team2.innerHTML = "";
  
    data.team1.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (${p.position}) - ${p.rating}/10`;
      team1.appendChild(li);
    });
  
    data.team2.forEach(p => {
      const li = document.createElement("li");
      li.textContent = `${p.name} (${p.position}) - ${p.rating}/10`;
      team2.appendChild(li);
    });
  }
  