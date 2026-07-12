document.addEventListener("DOMContentLoaded", async () => {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const authHeaders = {
        "Authorization": "Bearer " + token
    };

    let vehicles = [];
    let trips = [];

    try {
        const [vehiclesRes, tripsRes] = await Promise.all([
            fetch("/api/vehicles", { headers: authHeaders }),
            fetch("/api/trips", { headers: authHeaders })
        ]);

        if (vehiclesRes.status === 401 || tripsRes.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
            return;
        }

        vehicles = await vehiclesRes.json();
        trips = await tripsRes.json();

    } catch (err) {
        console.error("Failed to load dashboard data:", err);
        return;
    }

    updateDashboard(vehicles, trips);
    populateFilters(vehicles);

    document.getElementById('filter-type').addEventListener('change', () => applyFilters(vehicles, trips));
    document.getElementById('filter-status').addEventListener('change', () => applyFilters(vehicles, trips));
});

// Update everything based on provided datasets
function updateDashboard(vehicles, trips) {
    calculateKPIs(vehicles, trips);
    renderRecentTrips(trips);
}

function calculateKPIs(vehicles, trips) {
    const totalVehicles = vehicles.length;
    const availableCount = vehicles.filter(v => v.status === "AVAILABLE").length;
    const maintenanceCount = vehicles.filter(v => v.status === "IN_SHOP").length;
    const activeTripsCount = trips.filter(t => t.status === "DISPATCHED").length;

    const utilization = totalVehicles > 0 ? Math.round((activeTripsCount / totalVehicles) * 100) : 0;

    document.getElementById("kpi-active").textContent = totalVehicles;
    document.getElementById("kpi-available").textContent = availableCount;
    document.getElementById("kpi-maintenance").textContent = maintenanceCount;
    document.getElementById("kpi-trips").textContent = activeTripsCount;
    document.getElementById("kpi-utilization").textContent = utilization + "%";
}

function renderRecentTrips(trips) {
    const tableBody = document.getElementById("recent-trips-body");
    tableBody.innerHTML = "";

    const sorted = [...trips].sort((a, b) => new Date(b.dispatchDate) - new Date(a.dispatchDate));

    sorted.forEach(trip => {
        let badgeClass = "bg-secondary";
        if (trip.status === "DISPATCHED") badgeClass = "bg-info text-dark";
        if (trip.status === "COMPLETED") badgeClass = "bg-success";
        if (trip.status === "CANCELLED") badgeClass = "bg-danger";

        const vehicleLabel = trip.vehicle ? trip.vehicle.registrationNumber : "-";
        const driverLabel = trip.driver ? trip.driver.name : "-";
        const statusLabel = trip.status.charAt(0) + trip.status.slice(1).toLowerCase();

        tableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${trip.tripNumber}</td>
                <td>${vehicleLabel}</td>
                <td>${driverLabel}</td>
                <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
            </tr>
        `);
    });
}

function populateFilters(vehicles) {
    const typeSelect = document.getElementById('filter-type');
    const statusSelect = document.getElementById('filter-status');

    const types = [...new Set(vehicles.map(v => v.vehicleType))];
    const statuses = [...new Set(vehicles.map(v => v.status))];

    types.forEach(t => typeSelect.insertAdjacentHTML('beforeend', `<option value="${t}">${t}</option>`));
    statuses.forEach(s => statusSelect.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));
}

// Logic to actually filter the data
function applyFilters(vehicles, trips) {
    const selectedType = document.getElementById('filter-type').value;
    const selectedStatus = document.getElementById('filter-status').value;

    const filteredVehicles = vehicles.filter(v => {
        const matchType = selectedType === "" || selectedType.includes("All") || v.vehicleType === selectedType;
        const matchStatus = selectedStatus === "" || selectedStatus.includes("All") || v.status === selectedStatus;
        return matchType && matchStatus;
    });

    updateDashboard(filteredVehicles, trips);
}