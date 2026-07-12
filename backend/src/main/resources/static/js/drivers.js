let allDrivers = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadDrivers();
    document.getElementById('search-driver').addEventListener('keyup', filterDrivers);
});

async function loadDrivers() {
    try {
        const res = await fetch("/api/drivers", { headers: authHeaders() });

        if (res.status === 401) {
            logout();
            return;
        }

        allDrivers = await res.json();
        renderDrivers(allDrivers);

    } catch (err) {
        console.error("Failed to load drivers:", err);
    }
}

function renderDrivers(data) {
    const tbody = document.getElementById("driver-table-body");
    tbody.innerHTML = "";

    data.forEach(driver => {
        let statusBadge = "bg-success";
        if (driver.status === "ON_TRIP") statusBadge = "bg-primary";
        if (driver.status === "SUSPENDED") statusBadge = "bg-danger";
        if (driver.status === "OFF_DUTY") statusBadge = "bg-secondary";

        const statusLabel = driver.status.charAt(0) + driver.status.slice(1).toLowerCase().replace("_", " ");

        // Flag licenses expiring within 60 days
        const expiryDate = new Date(driver.licenseExpiryDate);
        const isExpiringSoon = (expiryDate - new Date()) / (1000 * 60 * 60 * 24) < 60;
        const expiryText = isExpiringSoon
            ? `<span class="text-danger fw-bold">${driver.licenseExpiryDate}</span>`
            : driver.licenseExpiryDate;

        let safetyBadge = driver.safetyScore >= 80 ? "bg-success" : driver.safetyScore >= 50 ? "bg-warning text-dark" : "bg-danger";

        const row = `
            <tr>
                <td class="fw-medium">${driver.name}</td>
                <td class="text-uppercase">${driver.licenseNumber}</td>
                <td>${driver.licenseCategory}</td>
                <td>${expiryText}</td>
                <td>${driver.contactNumber}</td>
                <td><span class="badge ${safetyBadge} w-100 py-2">${driver.safetyScore}</span></td>
                <td><span class="badge ${statusBadge} w-100 py-2">${statusLabel}</span></td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function filterDrivers() {
    const searchVal = document.getElementById('search-driver').value.toLowerCase();
    const filtered = allDrivers.filter(d =>
        d.name.toLowerCase().includes(searchVal) ||
        d.licenseNumber.toLowerCase().includes(searchVal)
    );
    renderDrivers(filtered);
}

document.getElementById('addDriverForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const newDriver = {
        name: document.getElementById('new-name').value,
        licenseNumber: document.getElementById('new-license').value.toUpperCase(),
        licenseCategory: document.getElementById('new-category').value,
        licenseExpiryDate: document.getElementById('new-expiry').value,
        contactNumber: document.getElementById('new-contact').value,
        email: document.getElementById('new-email').value,
        safetyScore: 100,
        status: "AVAILABLE"
    };

    try {
        const res = await fetch("/api/drivers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(newDriver)
        });

        if (res.status === 401) {
            logout();
            return;
        }

        if (!res.ok) {
            if (typeof showToast === 'function') {
                showToast("Failed to save driver. Check the form and try again.", 'danger');
            }
            return;
        }

        await loadDrivers();

        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addDriverModal'));
        modalInstance.hide();
        this.reset();

        if (typeof showToast === 'function') {
            showToast(`Driver ${newDriver.name} added successfully!`, 'success');
        }

    } catch (err) {
        console.error("Failed to create driver:", err);
        if (typeof showToast === 'function') {
            showToast("Network error - couldn't reach the server.", 'danger');
        }
    }
});