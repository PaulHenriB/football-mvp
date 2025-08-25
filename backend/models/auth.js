document.getElementById('signup-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());
    
    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    
    if (response.ok) {
        window.location.href = 'profile.html'; // Redirect to profile on successful registration
    } else {
        console.error("Error during registration");
    }
});
