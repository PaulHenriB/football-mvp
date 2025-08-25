document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const successMessage = document.getElementById("success-message");

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        let isValid = true;
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Clear previous error messages
        document.querySelectorAll(".error").forEach(error => error.style.display = "none");

        if (!emailPattern.test(email)) {
            displayError("email-error", "Enter a valid email address.");
            isValid = false;
        }
        if (password.length < 6) {
            displayError("password-error", "Password must be at least 6 characters.");
            isValid = false;
        }

        if (isValid) {
            // Simulate login process (Replace this with actual authentication)
            successMessage.style.display = "block";
            successMessage.textContent = "Login successful!";
            setTimeout(() => {
                window.location.href = "dashboard.html"; // Redirect to dashboard
            }, 2000);
        }
    });

    function displayError(id, message) {
        const errorElement = document.getElementById(id);
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
});
