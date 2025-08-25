document.addEventListener("DOMContentLoaded", function () {
    const venueForm = document.getElementById("venue-form");
    const venueList = document.getElementById("venues");

    function loadVenues() {
        const venues = JSON.parse(localStorage.getItem("venues")) || [];
        venueList.innerHTML = "";
        venues.forEach((venue, index) => addVenueToDOM(venue, index));
    }

    function addVenueToDOM(venue, index) {
        const venueItem = document.createElement("li");
        venueItem.classList.add("venue-item");
        venueItem.innerHTML = `
            <h3>${venue.name}</h3>
            <p><strong>Location:</strong> ${venue.location}</p>
            <p><strong>Capacity:</strong> ${venue.capacity}</p>
            <p><strong>Reviews:</strong> ${venue.reviews.length}</p>
            <button class="review-btn" data-index="${index}">Add Review</button>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        venueList.appendChild(venueItem);
    }

    venueForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("venue-name").value.trim();
        const location = document.getElementById("venue-location").value.trim();
        const capacity = parseInt(document.getElementById("venue-capacity").value);

        if (!name || !location || isNaN(capacity) || capacity <= 0) {
            alert("Please fill in all fields with valid values.");
            return;
        }

        const venues = JSON.parse(localStorage.getItem("venues")) || [];
        venues.push({ name, location, capacity, reviews: [] });
        localStorage.setItem("venues", JSON.stringify(venues));
        loadVenues();
        venueForm.reset();
    });

    venueList.addEventListener("click", function (event) {
        const index = event.target.dataset.index;
        let venues = JSON.parse(localStorage.getItem("venues")) || [];

        if (event.target.classList.contains("delete-btn")) {
            if (confirm("Are you sure you want to delete this venue?")) {
                venues.splice(index, 1);
                localStorage.setItem("venues", JSON.stringify(venues));
                loadVenues();
            }
        } else if (event.target.classList.contains("review-btn")) {
            const review = prompt("Enter your review:");
            if (review && review.trim() !== "") {
                venues[index].reviews.push(review.trim());
                localStorage.setItem("venues", JSON.stringify(venues));
                loadVenues();
            }
        }
    });

    loadVenues();
});
