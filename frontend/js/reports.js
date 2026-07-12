document.addEventListener("DOMContentLoaded", () => {
    calculateAndRenderKPIs();
    renderCharts();
    setupExport();
});

// 1. Math & KPIs
function calculateAndRenderKPIs() {
    // Mocking the required math variables
    const revenue = 500000;
    const maintenanceAndFuel = 34070; // From previous page
    const acquisitionCost = 3280000; // Combined cost of mock fleet

    // The mandatory Vehicle ROI Formula
    // ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
    const roi = ((revenue - maintenanceAndFuel) / acquisitionCost) * 100;

    // Displaying the calculated ROI safely rounded to 1 decimal place
    document.getElementById("kpi-roi").textContent = roi.toFixed(1) + "%";
}

// 2. Visual Analytics (Chart.js)
function renderCharts() {
    // Chart 1: Monthly Revenue (Bar Chart)
    const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
    new Chart(ctxRevenue, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Revenue (Rs)',
                data: [300000, 320000, 280000, 350000, 340000, 420000, 400000],
                backgroundColor: '#017E84', // Odoo Teal
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

    // Chart 2: Top Costliest Vehicles (Horizontal Bar)
    const ctxCost = document.getElementById('costChart').getContext('2d');
    new Chart(ctxCost, {
        type: 'bar',
        data: {
            labels: ['TRUCK-11', 'MINI-03', 'VAN-05'],
            datasets: [{
                label: 'Operational Cost (Rs)',
                data: [18000, 6200, 3150],
                backgroundColor: [
                    '#d9534f', // Red for highest
                    '#f0ad4e', // Orange
                    '#017E84'  // Normal Teal
                ],
                borderRadius: 4
            }]
        },
        options: {
            indexAxis: 'y', // Makes the bar chart horizontal
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, grid: { color: '#333' } },
                y: { grid: { display: false } }
            }
        }
    });
}

// 3. CSV Export Functionality
function setupExport() {
    document.getElementById('btn-export').addEventListener('click', () => {
        // Generating mock CSV content
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Metric,Value\n"
            + "Fuel Efficiency,8.4 km/l\n"
            + "Fleet Utilization,81%\n"
            + "Operational Cost,34070\n"
            + "Vehicle ROI,14.2%\n";

        // Create a hidden link, click it to download, then remove it
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "TransitOps_Analytics.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}