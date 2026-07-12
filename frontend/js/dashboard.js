// Mock Data
const mockVehicles = [
    { id: 1, regNo: "VAN-05", status: "Available", type: "Van" },
    { id: 2, regNo: "TRK-11", status: "In Shop", type: "Truck" },
    { id: 3, regNo: "MINI-08", status: "On Trip", type: "Mini" },
    { id: 4, regNo: "VAN-09", status: "Available", type: "Van" },
    { id: 5, regNo: "TRK-12", status: "Available", type: "Truck" }
];

const mockTrips = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
    { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "-" },
    { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "1h 10m" },
    { id: "TR004", vehicle: "-", driver: "-", status: "Draft", eta: "Awaiting vehicle" }
];

document.addEventListener("DOMContentLoaded", () => {
    updateDashboard(mockVehicles, mockTrips);
    populateFilters();

    // Add Event Listeners for filters
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('filter-status').addEventListener('change', applyFilters);
});

// Update everything based on provided datasets
function updateDashboard(vehicles, trips) {
    calculateKPIs(vehicles, trips);
    renderRecentTrips(trips);
}

function calculateKPIs(vehicles, trips) {
    const totalVehicles = vehicles.length;
    const availableCount = vehicles.filter(v => v.status === "Available").length;
    const maintenanceCount = vehicles.filter(v => v.status === "In Shop").length;
    const activeTripsCount = trips.filter(t => t.status === "On Trip" || t.status === "Dispatched").length;

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
    trips.forEach(trip => {
        let badgeClass = "bg-secondary";
        if (trip.status === "On Trip" || trip.status === "Dispatched") badgeClass = "bg-info text-dark";
        if (trip.status === "Completed") badgeClass = "bg-success";

        tableBody.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${trip.id}</td>
                <td>${trip.vehicle}</td>
                <td>${trip.driver}</td>
                <td><span class="badge ${badgeClass}">${trip.status}</span></td>
            </tr>
        `);
    });
}

function populateFilters() {
    const typeSelect = document.getElementById('filter-type');
    const statusSelect = document.getElementById('filter-status');

    const types = [...new Set(mockVehicles.map(v => v.type))];
    const statuses = [...new Set(mockVehicles.map(v => v.status))];

    types.forEach(t => typeSelect.insertAdjacentHTML('beforeend', `<option value="${t}">${t}</option>`));
    statuses.forEach(s => statusSelect.insertAdjacentHTML('beforeend', `<option value="${s}">${s}</option>`));
}

// Logic to actually filter the data
function applyFilters() {
    const selectedType = document.getElementById('filter-type').value;
    const selectedStatus = document.getElementById('filter-status').value;

    const filteredVehicles = mockVehicles.filter(v => {
        const matchType = selectedType === "" || selectedType === "Vehicle Type: All" || v.type === selectedType;
        const matchStatus = selectedStatus === "" || selectedStatus === "Status: All" || v.status === selectedStatus;
        return matchType && matchStatus;
    });

    updateDashboard(filteredVehicles, mockTrips);
}