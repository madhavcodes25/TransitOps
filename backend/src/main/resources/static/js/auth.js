// ===== LOGIN FORM WIRING (only runs if loginForm exists on the page) =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const errorBox = document.getElementById("login-error");

        errorBox.classList.add("d-none");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                errorBox.classList.remove("d-none");
                return;
            }

            const data = await response.json();
            localStorage.setItem("token", data.token);

            window.location.href = "dashboard.html";

        } catch (err) {
            console.error("Login request failed:", err);
            errorBox.classList.remove("d-none");
        }
    });
}

// ===== REGISTER FORM WIRING (only runs if registerForm exists on the page) =====
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        const errorBox = document.getElementById("register-error");
        const errorText = document.getElementById("register-error-text");
        errorBox.classList.add("d-none");

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, role })
            });

            if (!response.ok) {
                errorText.textContent = "❌ Registration failed. Email may already be in use.";
                errorBox.classList.remove("d-none");
                return;
            }

            // Registration succeeded - send them to login to sign in with their new account
            window.location.href = "login.html";

        } catch (err) {
            console.error("Registration request failed:", err);
            errorText.textContent = "❌ Network error - couldn't reach the server.";
            errorBox.classList.remove("d-none");
        }
    });
}

// ===== SHARED HELPERS FOR ALL PROTECTED PAGES =====

// Redirects to login if no token is present. Call this on every protected page.
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // Optional: decode JWT payload to show username/role in the navbar, if elements exist
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const usernameEl = document.getElementById("nav-username");
        const roleEl = document.getElementById("nav-role");
        if (usernameEl && payload.sub) usernameEl.textContent = payload.sub;
        if (roleEl && payload.role) roleEl.textContent = payload.role;
    } catch (e) {
        // Token isn't a standard JWT shape, or claims differ - safe to ignore
    }
}

// Returns the Authorization header object to attach to any authenticated fetch call
function authHeaders() {
    return { "Authorization": "Bearer " + localStorage.getItem("token") };
}

// Clears the token and returns to login
function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}