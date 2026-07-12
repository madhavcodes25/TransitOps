document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorBox = document.getElementById("login-error");

    // Hide any previous error before trying again
    errorBox.classList.add("d-none");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            // Backend rejected the login (bad credentials, etc.)
            errorBox.classList.remove("d-none");
            return;
        }

        const data = await response.json();

        // Adjust "data.token" below if your AuthResponse uses a different field name
        localStorage.setItem("token", data.token);

        // Redirect to your main app page after successful login
        window.location.href = "dashboard.html";

    } catch (err) {
        // Network-level failure (server unreachable, mixed content, etc.)
        console.error("Login request failed:", err);
        errorBox.classList.remove("d-none");
    }
});