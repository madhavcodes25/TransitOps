document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btn = loginForm.querySelector('button[type="submit"]');

            const originalText = btn.innerHTML;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Authenticating...`;
            btn.disabled = true;
            if (errorAlert) errorAlert.classList.add('d-none');

            try {
                const response = await API.login(email, password);

                localStorage.setItem("transitops_token", response.token);
                localStorage.setItem("transitops_user", response.name || email.split('@')[0]);
                localStorage.setItem("transitops_role", ROLE_LABELS[response.role] || response.role || 'User');

                window.location.href = "dashboard.html";
            } catch (err) {
                if (errorAlert) errorAlert.classList.remove('d-none');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }
});

function checkAuth() {
    const token = localStorage.getItem("transitops_token");
    const currentPage = window.location.pathname.split('/').pop();

    if (!token && currentPage !== 'login.html') {
        window.location.href = "login.html";
    }
}

function logout() {
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_role");
    localStorage.removeItem("transitops_user");
    window.location.href = "login.html";
}

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');

    if (!toastEl) return;

    toastEl.className = `toast align-items-center border-0 shadow-lg text-white ${type === 'success' ? 'bg-success' : 'bg-danger'}`;
    toastBody.innerHTML = message;

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}

function setupGlobalSearch() {
    const searchInput = document.querySelector('input[placeholder="Search..."]');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', function () {
        const searchTerm = this.value.toLowerCase();
        const table = document.querySelector('table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            row.style.display = rowText.includes(searchTerm) ? '' : 'none';
        });
    });
}

function updateUserInfo() {
    const username = localStorage.getItem("transitops_user");
    const role = localStorage.getItem("transitops_role");

    const userEl = document.getElementById("nav-username");
    const roleEl = document.getElementById("nav-role");

    if (userEl) userEl.textContent = username || "Guest";
    if (roleEl) roleEl.textContent = role || "N/A";
}

document.addEventListener("DOMContentLoaded", () => {
    checkAuth();
    updateUserInfo();
});
