document.getElementById('login-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = event.target[0].value;
    const password = event.target[1].value;
    console.log(`Logging in: ${email}`);
    localStorage.setItem('user', email);
    window.location.href = 'profile.html';
});

document.getElementById('logout')?.addEventListener('click', function() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
});

document.addEventListener('DOMContentLoaded', function() {
    const user = localStorage.getItem('user');
    if (user) document.getElementById('username').textContent = user;
});