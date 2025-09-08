document.addEventListener("DOMContentLoaded", () => {
  checkUserRole();
});

async function checkUserRole() {
  try {
    // Option 1: Get user role from localStorage (if you store it at login)
    const user = JSON.parse(localStorage.getItem("user"));
    let role = user?.role;

    // Option 2: If role not in localStorage, fetch from backend
    if (!role) {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) return;
      const data = await res.json();
      role = data.role;

      // Save for next time
      localStorage.setItem("user", JSON.stringify(data));
    }

    // Show Team Balancer link if user is a manager
    if (role === "manager") {
      document.getElementById("team-balancer-link").style.display = "inline-block";
    }
  } catch (err) {
    console.error("Error checking user role:", err);
  }
}
