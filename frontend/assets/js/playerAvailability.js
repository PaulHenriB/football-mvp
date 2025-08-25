document.addEventListener("DOMContentLoaded", () => {
    const filterDate = document.getElementById("filter-date");
    const filterPosition = document.getElementById("filter-position");
    const availabilityList = document.getElementById("availability-list");
    const updateForm = document.getElementById("update-availability-form");

    let players = [
        { name: "John Doe", position: "Forward", date: "2025-03-24", available: true },
        { name: "Jane Smith", position: "Midfielder", date: "2025-03-24", available: false },
        { name: "Alex Brown", position: "Defender", date: "2025-03-25", available: true }
    ];

    function renderPlayers() {
        availabilityList.innerHTML = "";
        let filteredPlayers = players.filter(player => 
            (!filterDate.value || player.date === filterDate.value) &&
            (!filterPosition.value || player.position === filterPosition.value)
        );

        filteredPlayers.forEach(player => {
            let listItem = document.createElement("li");
            listItem.textContent = `${player.name} - ${player.position} (${player.date}) - ${player.available ? "Available" : "Not Available"}`;
            availabilityList.appendChild(listItem);
        });
    }

    filterDate.addEventListener("change", renderPlayers);
    filterPosition.addEventListener("change", renderPlayers);

    updateForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const playerName = document.getElementById("player-name").value;
        const playerDate = document.getElementById("player-date").value;
        const isAvailable = document.getElementById("availability-status").checked;

        let player = players.find(p => p.name === playerName && p.date === playerDate);
        if (player) {
            player.available = isAvailable;
        } else {
            players.push({ name: playerName, position: "Unknown", date: playerDate, available: isAvailable });
        }

        renderPlayers();
        updateForm.reset();
    });

    renderPlayers();
});
