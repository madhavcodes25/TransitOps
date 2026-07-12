// Holds the current full dataset fetched from the backend
let allVehicles = [];

// 1. Initialization
document.addEventListener("DOMContentLoaded", async () => {
    await loadVehicles();

    document.getElementById('search-reg').addEventListener('keyup', filterVehicles);
    document.getElementById('filter-type').addEventListener('change', filterVehicles);
    document.getElementById('filter-status').addEventListener('change', filterVehicles);
});

// 2. Fetch real vehicles from the backend
async function loadVehicles() {
    try {
        const res = await fetch("/api/vehicles", { headers: authHeaders() });

        if (res.status === 401) {
            logout();
            return;
        }

        allVehicles = await res.json();
        renderVehicles(allVehicles);

    } catch (err) {
        console.error("Failed to load vehicles:", err);
    }
}

// 3. Render Function
function renderVehicles(data) {
    const tbody = document.getElementById("vehicle-table-body");
    tbody.innerHTML = "";

    data.forEach(vehicle => {
        let badgeClass = "";
        switch (vehicle.status) {
            case "AVAILABLE": badgeClass = "bg-success"; break;
            case "ON_TRIP": badgeClass = "bg-primary"; break;
            case "IN_SHOP": badgeClass = "bg-warning text-dark"; break;
            case "RETIRED": badgeClass = "bg-danger"; break;
        }

        const statusLabel = vehicle.status.charAt(0) + vehicle.status.slice(1).toLowerCase().replace("_", " ");

        const row = `
            <tr>
                <td class="fw-medium">${vehicle.registrationNumber}</td>
                <td>${vehicle.vehicleName}</td>
                <td>${vehicle.vehicleType}</td>
                <td>${vehicle.maxLoadCapacity}</td>
                <td>${vehicle.odometer}</td>
                <td>${vehicle.acquisitionCost}</td>
                <td><span class="badge ${badgeClass} w-100 py-2">${statusLabel}</span></td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// 4. Handle Form Submission - creates a real vehicle via POST /api/vehicles
document.getElementById('addVehicleForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const regInput = document.getElementById('new-reg').value.toUpperCase().trim();
    const errorAlert = document.getElementById('reg-error');

    // Client-side duplicate check against currently loaded data (backend also enforces uniqueness)
    const exists = allVehicles.some(v => v.registrationNumber.toUpperCase() === regInput);

    if (exists) {
        errorAlert.classList.remove('d-none');
        return;
    }

    errorAlert.classList.add('d-none');

    const newVehicle = {
        registrationNumber: regInput,
        vehicleName: document.getElementById('new-model').value.toUpperCase(),
        vehicleType: document.getElementById('new-type').value.toUpperCase(),
        region: "N/A",
        maxLoadCapacity: parseFloat(document.getElementById('new-capacity').value) || 0,
        odometer: parseFloat(document.getElementById('new-odo').value) || 0,
        acquisitionCost: parseFloat(document.getElementById('new-cost').value) || 0,
        status: "AVAILABLE"
    };

    try {
        const res = await fetch("/api/vehicles", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(newVehicle)
        });

        if (res.status === 401) {
            logout();
            return;
        }

        if (!res.ok) {
            errorAlert.textContent = "Failed to save vehicle. Check the form values and try again.";
            errorAlert.classList.remove('d-none');
            return;
        }

        // Refresh the table with the latest data from the backend
        await loadVehicles();

        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addVehicleModal'));
        modalInstance.hide();
        this.reset();

        if (typeof showToast === 'function') {
            showToast(`Vehicle ${regInput} added to fleet!`, 'success');
        }

    } catch (err) {
        console.error("Failed to create vehicle:", err);
        errorAlert.textContent = "Network error - couldn't reach the server.";
        errorAlert.classList.remove('d-none');
    }
});

// 5. Filter Logic - filters the already-loaded dataset client-side
function filterVehicles() {
    const searchVal = document.getElementById('search-reg').value.toLowerCase();
    const typeVal = document.getElementById('filter-type').value;
    const statusVal = document.getElementById('filter-status').value;

    const statusMap = {
        "Available": "AVAILABLE",
        "On Trip": "ON_TRIP",
        "In Shop": "IN_SHOP",
        "Retired": "RETIRED"
    };

    const filtered = allVehicles.filter(v => {
        const matchesSearch = v.registrationNumber.toLowerCase().includes(searchVal) ||
            v.vehicleName.toLowerCase().includes(searchVal);
        const matchesType = (typeVal === "All" || v.vehicleType.toUpperCase() === typeVal.toUpperCase());
        const matchesStatus = (statusVal === "All" || v.status === statusMap[statusVal]);

        return matchesSearch && matchesType && matchesStatus;
    });

    renderVehicles(filtered);
}