document.addEventListener("DOMContentLoaded", () => {
    const matchList = document.getElementById("match-list");
    const userNameEl = document.getElementById("user-name");

    let players = [];
    let matches = [];

    async function initDashboard() {
        await Promise.all([loadUser(), loadPlayers(), loadMatches()]);
    }

    // Load current user info (dummy placeholder logic)
    async function loadUser() {
        try {
            // Simulated fetch; replace with real auth/user data if needed
            const user = { name: "John Doe" }; 
            userNameEl.textContent = user.name;
        } catch (error) {
            console.error("Failed to load user data:", error);
        }
    }

    async function loadPlayers() {
        try {
            const res = await fetch("/api/players");
            players = await res.json();
        } catch (error) {
            console.error("Failed to load players:", error);
        }
    }

    async function loadMatches() {
        try {
            const res = await fetch("/api/matches");
            matches = await res.json();
            renderMatches();
        } catch (error) {
            console.error("Failed to load matches:", error);
            matchList.innerHTML = `<li>Error loading matches. Try again later.</li>`;
        }
    }

    function renderMatches() {
        matchList.innerHTML = "";

        if (matches.length === 0) {
            matchList.innerHTML = `<li>No upcoming matches.</li>`;
            return;
        }

        matches.forEach((match, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span><strong>${match.date} - ${match.time}</strong> @ ${match.location}</span>
                <button onclick="balanceTeams(${index})">Balance</button>
            `;
            matchList.appendChild(li);
        });
    }

    // Global function for balancing teams
    window.balanceTeams = function (matchIndex) {
        const match = matches[matchIndex];
        const sorted = [...players].sort((a, b) => b.rating - a.rating);
        const teamA = [], teamB = [];

        sorted.forEach((player, i) => {
            (i % 2 === 0 ? teamA : teamB).push(player);
        });

        match.teams = { teamA, teamB };

        alert(`Teams balanced for ${match.date}:\n\nTeam A:\n${teamA.map(p => p.name).join(', ')}\n\nTeam B:\n${teamB.map(p => p.name).join(', ')}`);
        console.log("Balanced teams:", match.teams);
    };

    initDashboard();
});
