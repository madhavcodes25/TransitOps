//Mock Data
const mockVehicles = [
    { id: 1, regNo: "VAN-05", status: "Available" },
    { id: 2, regNo: "TRK-11", status: "In Shop" },
    { id: 3, regNo: "MINI-08", status: "On Trip" },
    { id: 4, regNo: "VAN-09", status: "Available" },
    { id: 5, regNo: "TRK-12", status: "Available" }
];

const mockTrips = [
    { id: "TR001", vehicle: "VAN-05", driver: "Alex", status: "On Trip", eta: "45 min" },
    { id: "TR002", vehicle: "TRK-12", driver: "John", status: "Completed", eta: "-" },
    { id: "TR003", vehicle: "MINI-08", driver: "Priya", status: "Dispatched", eta: "1h 10m" },
    { id: "TR004", vehicle: "-", driver: "-", status: "Draft", eta: "Awaiting vehicle" }
];

//Main Execution Function
document.addEventListener("DOMContentLoaded", () => {
    calculateKPIs();
    renderRecentTrips();
});

//Logic to Calculate and Inject KPIs
function calculateKPIs() {
    // Total Vehicles
    const totalVehicles = mockVehicles.length;

    // Filter arrays to get counts
    const availableCount = mockVehicles.filter(v => v.status === "Available").length;
    const maintenanceCount = mockVehicles.filter(v => v.status === "In Shop").length;

    const activeTripsCount = mockTrips.filter(t => t.status === "On Trip" || t.status === "Dispatched").length;

    // Calculate Fleet Utilization % ((Total - Maintenance - Available) / Total) * 100
    // Simplified for mock: (Active Trips / Total Vehicles) * 100
    const utilization = totalVehicles > 0 ? Math.round((activeTripsCount / totalVehicles) * 100) : 0;

    // Inject into the DOM
    document.getElementById("kpi-active").textContent = totalVehicles;
    document.getElementById("kpi-available").textContent = availableCount;
    document.getElementById("kpi-maintenance").textContent = maintenanceCount;
    document.getElementById("kpi-trips").textContent = activeTripsCount;
    document.getElementById("kpi-utilization").textContent = utilization + "%";
}

// Logic to Populate the Table
function renderRecentTrips() {
    const tableBody = document.getElementById("recent-trips-body");
    tableBody.innerHTML = ""; // Clear existing hardcoded rows

    mockTrips.forEach(trip => {
        // Determine badge color based on status
        let badgeClass = "bg-secondary";
        if (trip.status === "On Trip" || trip.status === "Dispatched") badgeClass = "bg-info text-dark";
        if (trip.status === "Completed") badgeClass = "bg-success";
        if (trip.status === "Draft") badgeClass = "bg-secondary";

        const row = `
            <tr>
                <td>${trip.id}</td>
                <td>${trip.vehicle}</td>
                <td>${trip.driver}</td>
                <td><span class="badge ${badgeClass}">${trip.status}</span></td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}