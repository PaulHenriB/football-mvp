// ---------------------
// LOGIN FORM
// ---------------------
document.getElementById('login-form')?.addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const email = event.target[0].value;
    const password = event.target[1].value;

    try {
        const res = await fetch(`${window.__API_BASE__}auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.error || 'Login failed');
            return;
        }

        const data = await res.json();

        // Store token and user info (including role) in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to profile or dashboard
        window.location.href = 'dashboard.html';
    } catch (err) {
        console.error("Login error:", err);
        alert('Login failed');
    }
});

// ---------------------
// LOGOUT
// ---------------------
document.getElementById('logout')?.addEventListener('click', function() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

// ---------------------
// DISPLAY USERNAME
// ---------------------
document.addEventListener('DOMContentLoaded', function() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const usernameElem = document.getElementById('username');
        if (usernameElem) usernameElem.textContent = `${user.first_name} ${user.last_name}`;
    }
});
