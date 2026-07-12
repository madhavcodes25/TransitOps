// 1. Mock Data
let mockMaintenanceLogs = [
    { id: 1, vehicle: "VAN-05", service: "Oil Change", date: "2026-07-07", cost: "2,500", status: "Active" },
    { id: 2, vehicle: "TRUCK-11", service: "Engine Repair", date: "2026-06-15", cost: "18,000", status: "Completed" },
    { id: 3, vehicle: "MINI-03", service: "Tyre Replace", date: "2026-07-10", cost: "6,200", status: "Active" }
];

document.addEventListener("DOMContentLoaded", () => {
    renderMaintenanceLogs();
});

// 2. Render the Table
function renderMaintenanceLogs() {
    const tbody = document.getElementById("maintenance-table-body");
    tbody.innerHTML = "";

    mockMaintenanceLogs.forEach((log, index) => {
        let badgeClass = log.status === "Active" ? "bg-warning text-dark" : "bg-success";
        let actionButton = log.status === "Active"
            ? `<button class="btn btn-sm btn-outline-success py-0" onclick="closeRecord(${index})">Mark Done</button>`
            : `<span class="text-muted small">Closed</span>`;

        const row = `
            <tr>
                <td class="fw-medium">${log.vehicle}</td>
                <td>${log.service}</td>
                <td>${log.date}</td>
                <td>₹${log.cost}</td>
                <td><span class="badge ${badgeClass} px-3 py-2">${log.status}</span></td>
                <td>${actionButton}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// 3. Handle Form Submission (Create Record)
document.getElementById('maintenanceForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const vehicle = document.getElementById('maint-vehicle').value;
    const status = document.getElementById('maint-status').value;

    const newLog = {
        id: mockMaintenanceLogs.length + 1,
        vehicle: vehicle,
        service: document.getElementById('maint-type').value,
        cost: document.getElementById('maint-cost').value,
        date: document.getElementById('maint-date').value,
        status: status
    };

    mockMaintenanceLogs.unshift(newLog); // Add to top

    // Business Rule execution would normally happen via API here:
    // If status === "Active", send API call to update Vehicle status to "In Shop"
    // If status === "Completed", send API call to update Vehicle status to "Available"
    console.log(`[API Trigger] Vehicle ${vehicle} status updated to: ${status === "Active" ? "In Shop" : "Available"}`);

    renderMaintenanceLogs();
    this.reset();
    document.getElementById('maint-date').valueAsDate = new Date(); // Reset date

    showToast(`Service record logged for ${vehicle}.`, 'success');
});

// 4. Handle Closing a Record
window.closeRecord = function (index) {
    // 1. Update log status
    mockMaintenanceLogs[index].status = "Completed";

    // 2. Trigger business logic
    const vehicle = mockMaintenanceLogs[index].vehicle;
    
    // 3. Provide user feedback
    showToast(`Service for ${vehicle} completed.`, 'success');

    // 4. Re-render
    renderMaintenanceLogs();
};