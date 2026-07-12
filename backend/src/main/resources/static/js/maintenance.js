let allVehicles = [];
let allLogs = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadVehiclesForDropdown();
    await loadLogs();
});

async function loadVehiclesForDropdown() {
    try {
        const res = await fetch("/api/vehicles", { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }

        allVehicles = await res.json();

        const select = document.getElementById('maint-vehicle');
        select.innerHTML = '<option value="">Select a vehicle...</option>';
        allVehicles.forEach(v => {
            select.insertAdjacentHTML('beforeend', `<option value="${v.id}">${v.registrationNumber}</option>`);
        });

    } catch (err) {
        console.error("Failed to load vehicles:", err);
    }
}

async function loadLogs() {
    try {
        const res = await fetch("/api/maintenance", { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }

        allLogs = await res.json();
        renderMaintenanceLogs();

    } catch (err) {
        console.error("Failed to load maintenance logs:", err);
    }
}

function renderMaintenanceLogs() {
    const tbody = document.getElementById("maintenance-table-body");
    tbody.innerHTML = "";

    const sorted = [...allLogs].sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate));

    sorted.forEach(log => {
        let badgeClass = log.status === "ACTIVE" ? "bg-warning text-dark" : "bg-success";
        let actionButton = log.status === "ACTIVE"
            ? `<button class="btn btn-sm btn-outline-success py-0" onclick="closeRecord(${log.id})">Mark Done</button>`
            : `<span class="text-muted small">Closed</span>`;

        const vehicleLabel = log.vehicle ? log.vehicle.registrationNumber : "-";

        const row = `
            <tr>
                <td class="fw-medium">${vehicleLabel}</td>
                <td>${log.serviceType}</td>
                <td>${log.serviceDate}</td>
                <td>₹${log.cost}</td>
                <td><span class="badge ${badgeClass} px-3 py-2">${log.status.charAt(0) + log.status.slice(1).toLowerCase()}</span></td>
                <td>${actionButton}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

document.getElementById('maintenanceForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const vehicleId = document.getElementById('maint-vehicle').value;
    const statusVal = document.getElementById('maint-status').value; // "Active" or "Completed"
    const status = statusVal === "Active" ? "ACTIVE" : "COMPLETED";

    const newLog = {
        vehicle: { id: parseInt(vehicleId) },
        serviceType: document.getElementById('maint-type').value,
        cost: parseFloat(document.getElementById('maint-cost').value),
        serviceDate: document.getElementById('maint-date').value,
        status: status
    };

    try {
        const res = await fetch("/api/maintenance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(newLog)
        });

        if (res.status === 401) { logout(); return; }

        if (!res.ok) {
            if (typeof showToast === 'function') {
                showToast("Failed to save service record. Check the form and try again.", 'danger');
            }
            return;
        }

        await loadLogs();

        this.reset();
        document.getElementById('maint-date').valueAsDate = new Date();

        if (typeof showToast === 'function') {
            showToast(`Service record logged.`, 'success');
        }

    } catch (err) {
        console.error("Failed to create maintenance log:", err);
        if (typeof showToast === 'function') {
            showToast("Network error - couldn't reach the server.", 'danger');
        }
    }
});

// Mark a record as completed via PUT /api/maintenance/{id}
window.closeRecord = async function (id) {
    const log = allLogs.find(l => l.id === id);
    if (!log) return;

    const updatedLog = {
        vehicle: { id: log.vehicle.id },
        serviceType: log.serviceType,
        cost: log.cost,
        serviceDate: log.serviceDate,
        completionDate: new Date().toISOString().split('T')[0],
        status: "COMPLETED",
        remarks: log.remarks || null
    };

    try {
        const res = await fetch(`/api/maintenance/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(updatedLog)
        });

        if (res.status === 401) { logout(); return; }

        if (!res.ok) {
            if (typeof showToast === 'function') {
                showToast("Failed to update record.", 'danger');
            }
            return;
        }

        await loadLogs();

        if (typeof showToast === 'function') {
            showToast(`Service marked complete.`, 'success');
        }

    } catch (err) {
        console.error("Failed to update maintenance log:", err);
    }
};