let allVehicles = [];
let allTrips = [];
let allFuelLogs = [];
let allExpenses = [];
let allMaintenanceLogs = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadAllData();
    calculateAndRenderKPIs();
    renderCharts();
    setupExport();
});

async function loadAllData() {
    try {
        const [vRes, tRes, fRes, eRes, mRes] = await Promise.all([
            fetch("/api/vehicles", { headers: authHeaders() }),
            fetch("/api/trips", { headers: authHeaders() }),
            fetch("/api/fuel", { headers: authHeaders() }),
            fetch("/api/expenses", { headers: authHeaders() }),
            fetch("/api/maintenance", { headers: authHeaders() })
        ]);

        if ([vRes, tRes, fRes, eRes, mRes].some(r => r.status === 401)) {
            logout();
            return;
        }

        allVehicles = await vRes.json();
        allTrips = await tRes.json();
        allFuelLogs = await fRes.json();
        allExpenses = await eRes.json();
        allMaintenanceLogs = await mRes.json();

    } catch (err) {
        console.error("Failed to load analytics data:", err);
    }
}

function calculateAndRenderKPIs() {
    // Fuel efficiency: total planned distance across trips / total liters logged
    const totalDistance = allTrips.reduce((sum, t) => sum + (t.actualDistance || t.plannedDistance || 0), 0);
    const totalLiters = allFuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const efficiency = totalLiters > 0 ? (totalDistance / totalLiters) : 0;

    // Fleet utilization: vehicles not AVAILABLE / total vehicles
    const totalVehicles = allVehicles.length;
    const activeVehicles = allVehicles.filter(v => v.status === "ON_TRIP").length;
    const utilization = totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0;

    // Operational cost: fuel + expenses + maintenance
    const totalFuelCost = allFuelLogs.reduce((sum, f) => sum + f.fuelCost, 0);
    const totalExpenseCost = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalMaintenanceCost = allMaintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const operationalCost = totalFuelCost + totalExpenseCost + totalMaintenanceCost;

    // Revenue: sum of trip.revenue
    const revenue = allTrips.reduce((sum, t) => sum + (t.revenue || 0), 0);

    // Acquisition cost across fleet
    const acquisitionCost = allVehicles.reduce((sum, v) => sum + (v.acquisitionCost || 0), 0);

    const roi = acquisitionCost > 0 ? ((revenue - operationalCost) / acquisitionCost) * 100 : 0;

    document.getElementById("kpi-efficiency").textContent = efficiency.toFixed(1) + " km/l";
    document.getElementById("kpi-utilization").textContent = utilization + "%";
    document.getElementById("kpi-cost").textContent = operationalCost.toLocaleString();
    document.getElementById("kpi-roi").textContent = roi.toFixed(1) + "%";
}

function renderCharts() {
    // Chart 1: Revenue by month (based on trip dispatchDate)
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = new Array(12).fill(0);

    allTrips.forEach(t => {
        if (t.dispatchDate && t.revenue) {
            const monthIdx = new Date(t.dispatchDate).getMonth();
            revenueByMonth[monthIdx] += t.revenue;
        }
    });

    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctxRevenue, {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [{
                label: 'Revenue (Rs)',
                data: revenueByMonth,
                backgroundColor: '#017E84',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Chart 2: Top costliest vehicles (fuel + maintenance cost per vehicle)
    const costByVehicle = {};

    allFuelLogs.forEach(f => {
        const reg = f.vehicle ? f.vehicle.registrationNumber : "Unknown";
        costByVehicle[reg] = (costByVehicle[reg] || 0) + f.fuelCost;
    });

    allMaintenanceLogs.forEach(m => {
        const reg = m.vehicle ? m.vehicle.registrationNumber : "Unknown";
        costByVehicle[reg] = (costByVehicle[reg] || 0) + m.cost;
    });

    const sortedEntries = Object.entries(costByVehicle).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = sortedEntries.map(e => e[0]);
    const data = sortedEntries.map(e => e[1]);
    const colors = data.map((_, i) => i === 0 ? '#d9534f' : i === 1 ? '#f0ad4e' : '#017E84');

    const ctxCost = document.getElementById('costChart').getContext('2d');
    new Chart(ctxCost, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Operational Cost (Rs)',
                data: data,
                backgroundColor: colors,
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: '#333' } },
                y: { grid: { display: false } }
            }
        }
    });
}

function setupExport() {
    document.getElementById('btn-export').addEventListener('click', () => {
        const csvContent = "Metric,Value\n"
            + "Fuel Efficiency," + document.getElementById("kpi-efficiency").textContent + "\n"
            + "Fleet Utilization," + document.getElementById("kpi-utilization").textContent + "\n"
            + "Operational Cost," + document.getElementById("kpi-cost").textContent + "\n"
            + "Vehicle ROI," + document.getElementById("kpi-roi").textContent + "\n";

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "TransitOps_Analytics.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (typeof showToast === 'function') {
            showToast("Report exported successfully!", "success");
        }
    });
}