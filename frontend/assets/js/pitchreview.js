// Load pitch options and existing reviews on page load
document.addEventListener("DOMContentLoaded", async () => {
    await loadPitches();
    await loadReviews();
  
    document.getElementById("review-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      await submitReview();
    });
  });
  
  async function loadPitches() {
    const res = await fetch("/api/pitches");
    const pitches = await res.json();
    const select = document.getElementById("pitch-select");
  
    pitches.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.name;
      select.appendChild(option);
    });
  }
  
  async function submitReview() {
    const pitchId = document.getElementById("pitch-select").value;
    const rating = document.getElementById("rating").value;
    const feedback = document.getElementById("feedback").value;
  
    const res = await fetch(`/api/pitches/${pitchId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, feedback })
    });
  
    if (res.ok) {
      alert("Review submitted successfully!");
      document.getElementById("review-form").reset();
      loadReviews();
    } else {
      alert("Failed to submit review.");
    }
  }
  
  async function loadReviews() {
    const res = await fetch("/api/pitches/reviews");
    const reviews = await res.json();
    const container = document.getElementById("reviews-list");
    container.innerHTML = "";
  
    reviews.forEach(r => {
      const div = document.createElement("div");
      div.className = "review-card";
      div.innerHTML = `
        <h3>${r.pitchName}</h3>
        <p>Rating: ${"⭐".repeat(r.rating)}</p>
        <p>${r.feedback}</p>
      `;
      container.appendChild(div);
    });
  }