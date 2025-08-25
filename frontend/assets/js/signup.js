document.addEventListener("DOMContentLoaded", () => {
    const signUpForm = document.getElementById("signup-form");
    const successMessage = document.getElementById("success-message");

    signUpForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent form submission

        let isValid = true;
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Clear previous error messages
        document.querySelectorAll(".error").forEach(error => error.style.display = "none");

        if (name === "") {
            displayError("name-error", "Name is required.");
            isValid = false;
        }
        if (!emailPattern.test(email)) {
            displayError("email-error", "Enter a valid email address.");
            isValid = false;
        }
        if (password.length < 6) {
            displayError("password-error", "Password must be at least 6 characters long.");
            isValid = false;
        }
        if (password !== confirmPassword) {
            displayError("confirm-password-error", "Passwords do not match.");
            isValid = false;
        }

        if (isValid) {
            // Simulate sign-up process (Replace this with backend integration)
            successMessage.style.display = "block";
            successMessage.textContent = "Sign-up successful!";
            setTimeout(() => {
                window.location.href = "login.html"; // Redirect to login page
            }, 2000);
        }
    });

    function displayError(id, message) {
        const errorElement = document.getElementById(id);
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
});
