let allVehicles = [];
let allTrips = [];
let allFuelLogs = [];
let allExpenses = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadDropdownData();
    await loadFuelLogs();
    await loadExpenses();

    document.getElementById('search-fuel').addEventListener('keyup', filterFuelData);
    document.getElementById('filter-fuel-vehicle').addEventListener('change', filterFuelData);
});

async function loadDropdownData() {
    try {
        const [vRes, tRes] = await Promise.all([
            fetch("/api/vehicles", { headers: authHeaders() }),
            fetch("/api/trips", { headers: authHeaders() })
        ]);

        if (vRes.status === 401 || tRes.status === 401) { logout(); return; }

        allVehicles = await vRes.json();
        allTrips = await tRes.json();

        populateVehicleDropdowns();
        populateTripDropdown();

    } catch (err) {
        console.error("Failed to load dropdown data:", err);
    }
}

function populateVehicleDropdowns() {
    ['fuel-vehicle', 'exp-vehicle', 'filter-fuel-vehicle'].forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        const keepFirst = id === 'filter-fuel-vehicle';
        select.innerHTML = keepFirst ? '<option value="All">All Vehicles</option>' : '';

        allVehicles.forEach(v => {
            select.insertAdjacentHTML('beforeend', `<option value="${v.id}">${v.registrationNumber}</option>`);
        });
    });
}

function populateTripDropdown() {
    const select = document.getElementById('exp-trip');
    select.innerHTML = '';
    allTrips.forEach(t => {
        select.insertAdjacentHTML('beforeend', `<option value="${t.id}">${t.tripNumber}</option>`);
    });
}

async function loadFuelLogs() {
    try {
        const res = await fetch("/api/fuel", { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }

        allFuelLogs = await res.json();
        renderFuelTable(allFuelLogs);
        calculateTotalCost();

    } catch (err) {
        console.error("Failed to load fuel logs:", err);
    }
}

async function loadExpenses() {
    try {
        const res = await fetch("/api/expenses", { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }

        allExpenses = await res.json();
        renderExpenseTable(allExpenses);
        calculateTotalCost();

    } catch (err) {
        console.error("Failed to load expenses:", err);
    }
}

function renderFuelTable(data) {
    const tbody = document.getElementById("fuel-table-body");
    tbody.innerHTML = "";
    data.forEach(log => {
        const vehicleLabel = log.vehicle ? log.vehicle.registrationNumber : "-";
        const row = `
            <tr>
                <td class="fw-medium">${vehicleLabel}</td>
                <td>${log.fuelDate}</td>
                <td>${log.liters} L</td>
                <td>₹${log.fuelCost.toLocaleString()}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderExpenseTable(data) {
    const tbody = document.getElementById("expense-table-body");
    tbody.innerHTML = "";
    data.forEach(exp => {
        const tripLabel = exp.trip ? exp.trip.tripNumber : "-";
        const vehicleLabel = exp.trip && exp.trip.vehicle ? exp.trip.vehicle.registrationNumber : "-";
        const row = `
            <tr>
                <td class="fw-medium">${tripLabel}</td>
                <td>${vehicleLabel}</td>
                <td>${exp.expenseType === "TOLL" ? "₹" + exp.amount.toLocaleString() : "-"}</td>
                <td>${exp.expenseType !== "TOLL" ? "₹" + exp.amount.toLocaleString() + " (" + exp.expenseType + ")" : "-"}</td>
                <td>-</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function calculateTotalCost() {
    let totalFuel = allFuelLogs.reduce((sum, log) => sum + log.fuelCost, 0);
    let totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById("total-cost-display").textContent = (totalFuel + totalExpenses).toLocaleString();
}

function filterFuelData() {
    const searchVal = document.getElementById('search-fuel').value.toLowerCase();
    const vehicleVal = document.getElementById('filter-fuel-vehicle').value;

    const filtered = allFuelLogs.filter(log => {
        const regNo = log.vehicle ? log.vehicle.registrationNumber : "";
        const matchesSearch = regNo.toLowerCase().includes(searchVal);
        const matchesVehicle = (vehicleVal === "All" || String(log.vehicle?.id) === vehicleVal);
        return matchesSearch && matchesVehicle;
    });

    renderFuelTable(filtered);
}

document.getElementById('fuelForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const newLog = {
        vehicle: { id: parseInt(document.getElementById('fuel-vehicle').value) },
        liters: parseFloat(document.getElementById('fuel-liters').value),
        fuelCost: parseFloat(document.getElementById('fuel-cost').value),
        fuelDate: document.getElementById('fuel-date').value,
        odometerReading: parseFloat(document.getElementById('fuel-odometer').value)
    };

    try {
        const res = await fetch("/api/fuel", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(newLog)
        });

        if (res.status === 401) { logout(); return; }

        if (!res.ok) {
            if (typeof showToast === 'function') showToast("Failed to save fuel log.", 'danger');
            return;
        }

        await loadFuelLogs();

        bootstrap.Modal.getInstance(document.getElementById('logFuelModal')).hide();
        this.reset();
        document.getElementById('fuel-date').valueAsDate = new Date();

        if (typeof showToast === 'function') showToast(`Fuel log added!`, 'success');

    } catch (err) {
        console.error("Failed to create fuel log:", err);
        if (typeof showToast === 'function') showToast("Network error.", 'danger');
    }
});

document.getElementById('expenseForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const tripId = parseInt(document.getElementById('exp-trip').value);
    const toll = parseFloat(document.getElementById('exp-toll').value) || 0;
    const other = parseFloat(document.getElementById('exp-other').value) || 0;

    const requests = [];

    if (toll > 0) {
        requests.push(fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ trip: { id: tripId }, expenseType: "TOLL", amount: toll })
        }));
    }

    if (other > 0) {
        requests.push(fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ trip: { id: tripId }, expenseType: "OTHER", amount: other })
        }));
    }

    try {
        const results = await Promise.all(requests);

        if (results.some(r => r.status === 401)) { logout(); return; }
        if (results.some(r => !r.ok)) {
            if (typeof showToast === 'function') showToast("Failed to save one or more expenses.", 'danger');
            return;
        }

        await loadExpenses();

        bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
        this.reset();

        if (typeof showToast === 'function') showToast(`Expense saved successfully!`, 'success');

    } catch (err) {
        console.error("Failed to create expense:", err);
        if (typeof showToast === 'function') showToast("Network error.", 'danger');
    }
});