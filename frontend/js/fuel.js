// 1. Mock Data
let mockFuelLogs = [
    { id: 1, vehicle: "VAN-05", date: "05 Jul 2026", liters: 42, cost: 3150 },
    { id: 2, vehicle: "TRUCK-11", date: "06 Jul 2026", liters: 110, cost: 8400 },
    { id: 3, vehicle: "MINI-03", date: "06 Jul 2026", liters: 28, cost: 2050 }
];

let mockExpenses = [
    { id: 1, trip: "TR001", vehicle: "VAN-05", toll: 120, other: 0, maintLinked: 0 },
    { id: 2, trip: "TR002", vehicle: "TRK-12", toll: 340, other: 150, maintLinked: 18000 }
];

document.addEventListener("DOMContentLoaded", () => {
    renderFuelTable();
    renderExpenseTable();
    calculateTotalCost();
});

// 2. Render Functions
function renderFuelTable() {
    const tbody = document.getElementById("fuel-table-body");
    tbody.innerHTML = "";

    mockFuelLogs.forEach(log => {
        const row = `
            <tr>
                <td class="fw-medium">${log.vehicle}</td>
                <td>${log.date}</td>
                <td>${log.liters} L</td>
                <td>₹${log.cost.toLocaleString()}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

function renderExpenseTable() {
    const tbody = document.getElementById("expense-table-body");
    tbody.innerHTML = "";

    mockExpenses.forEach(exp => {
        const row = `
            <tr>
                <td class="fw-medium">${exp.trip}</td>
                <td>${exp.vehicle}</td>
                <td>₹${exp.toll.toLocaleString()}</td>
                <td>₹${exp.other.toLocaleString()}</td>
                <td>₹${exp.maintLinked.toLocaleString()}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// 3. Calculation Engine
function calculateTotalCost() {
    let totalFuel = mockFuelLogs.reduce((sum, log) => sum + parseFloat(log.cost), 0);
    let totalExpenses = mockExpenses.reduce((sum, exp) => sum + parseFloat(exp.toll) + parseFloat(exp.other) + parseFloat(exp.maintLinked), 0);

    let grandTotal = totalFuel + totalExpenses;

    // Update the DOM
    document.getElementById("total-cost-display").textContent = grandTotal.toLocaleString();
}

// 4. Form Handlers
document.getElementById('fuelForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newLog = {
        id: mockFuelLogs.length + 1,
        vehicle: document.getElementById('fuel-vehicle').value,
        date: document.getElementById('fuel-date').value,
        liters: parseFloat(document.getElementById('fuel-liters').value),
        cost: parseFloat(document.getElementById('fuel-cost').value)
    };

    mockFuelLogs.push(newLog);
    renderFuelTable();
    calculateTotalCost();

    bootstrap.Modal.getInstance(document.getElementById('logFuelModal')).hide();
    this.reset();
    document.getElementById('fuel-date').valueAsDate = new Date();
});

document.getElementById('expenseForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newExp = {
        id: mockExpenses.length + 1,
        trip: document.getElementById('exp-trip').value.toUpperCase(),
        vehicle: document.getElementById('exp-vehicle').value,
        toll: parseFloat(document.getElementById('exp-toll').value) || 0,
        other: parseFloat(document.getElementById('exp-other').value) || 0,
        maintLinked: 0 // Mocking that maintenance costs are pulled from API automatically
    };

    mockExpenses.push(newExp);
    renderExpenseTable();
    calculateTotalCost();

    bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
    this.reset();
});