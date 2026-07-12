document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button[type="submit"]');

            // 1. UI Loading State
            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Authenticating...`;
            btn.disabled = true;
            if (errorAlert) errorAlert.classList.add('d-none'); // Hide previous errors

            // 2. Simulate Backend API Call (800ms delay)
            setTimeout(() => {
                // Mock Error Handling: Reject if password is exactly "wrong"
                if (password === 'wrong') {
                    if (errorAlert) errorAlert.classList.remove('d-none');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    return;
                }

                // 3. Successful Login Setup
                const selectedRole = document.getElementById('roleSim').value;

                // Store simulated JWT token and user data
                localStorage.setItem("transitops_token", "mock_jwt_" + Date.now());
                localStorage.setItem("transitops_role", selectedRole);
                localStorage.setItem("transitops_user", email.split('@')[0]); // Fake username from email

                // Redirect to the dashboard
                window.location.href = "dashboard.html";
            }, 800);
        });
    }
});

// Global Function to check if user is logged in
function checkAuth() {
    const token = localStorage.getItem("transitops_token");
    const currentPage = window.location.pathname.split('/').pop();

    // If no token exists and we are NOT on the login page, kick them out
    if (!token && currentPage !== 'login.html') {
        window.location.href = "login.html";
    }
}

// Global Function to handle logout
function logout() {
    // Clear the storage
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_role");
    localStorage.removeItem("transitops_user");

    // Redirect to login
    window.location.href = "login.html";
}