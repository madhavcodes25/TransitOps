// 1. Unified Mock Data
const mockVehicles = [
    { id: 1, regNo: "VAN-05", model: "VAN-05", capacityKg: 500, status: "Available" },
    { id: 2, regNo: "TRUCK-11", model: "TRUCK-11", capacityKg: 5000, status: "On Trip" },
    { id: 3, regNo: "MINI-03", model: "MINI-03", capacityKg: 1000, status: "In Shop" },
    { id: 4, regNo: "VAN-09", model: "VAN-09", capacityKg: 750, status: "Available" }
];

const mockDrivers = [
    { id: 1, name: "Alex", status: "Available" },
    { id: 2, name: "John", status: "Suspended" },
    { id: 3, name: "Priya", status: "On Trip" },
    { id: 4, name: "Suresh", status: "Available" }
];

let mockTrips = [
    { id: "TR001", source: "Gandhinagar Depot", dest: "Ahmedabad Hub", vehicle: "VAN-05", driver: "Alex", status: "Dispatched" },
    { id: "TR004", source: "Vatva Industrial", dest: "Sanand Warehouse", vehicle: "-", driver: "-", status: "Draft" }
];

// 2. DOM Elements
const vehicleSelect = document.getElementById('trip-vehicle');
const driverSelect = document.getElementById('trip-driver');
const weightInput = document.getElementById('trip-weight');
const btnDispatch = document.getElementById('btn-dispatch');
const errorAlert = document.getElementById('capacity-error');
const maxCapDisplay = document.getElementById('max-cap-display');
const overageDisplay = document.getElementById('overage-display');
const liveBoard = document.getElementById('live-board-container');

// 3. Initialization
document.addEventListener("DOMContentLoaded", () => {
    populateDropdowns();
    renderLiveBoard();

    // Listeners for live validation
    vehicleSelect.addEventListener('change', validateDispatch);
    weightInput.addEventListener('input', validateDispatch);

    // Cancel Button functionality
    document.getElementById('btn-cancel').addEventListener('click', () => {
        document.getElementById('createTripForm').reset();
        validateDispatch(); 
    });
});

// 4. Populate Dropdowns (Applying Business Rules)
function populateDropdowns() {
    vehicleSelect.innerHTML = '<option value="">Select a vehicle...</option>';
    driverSelect.innerHTML = '<option value="">Select a driver...</option>';

    const availableVehicles = mockVehicles.filter(v => v.status === "Available");
    const availableDrivers = mockDrivers.filter(d => d.status === "Available");

    availableVehicles.forEach(v => {
        vehicleSelect.insertAdjacentHTML('beforeend', `<option value="${v.regNo}" data-cap="${v.capacityKg}">${v.regNo} - ${v.capacityKg} kg</option>`);
    });

    availableDrivers.forEach(d => {
        driverSelect.insertAdjacentHTML('beforeend', `<option value="${d.name}">${d.name}</option>`);
    });
}

// 5. Live Capacity Validation Engine
function validateDispatch() {
    const selectedVehicleOption = vehicleSelect.options[vehicleSelect.selectedIndex];
    const cargoWeight = parseFloat(weightInput.value) || 0;

    if (!selectedVehicleOption || !selectedVehicleOption.value) {
        btnDispatch.disabled = true;
        errorAlert.classList.add('d-none');
        return;
    }

    const maxCapacity = parseFloat(selectedVehicleOption.getAttribute('data-cap'));

    if (cargoWeight > maxCapacity) {
        maxCapDisplay.textContent = maxCapacity;
        overageDisplay.textContent = cargoWeight - maxCapacity;
        errorAlert.classList.remove('d-none');
        btnDispatch.disabled = true;
    } else {
        errorAlert.classList.add('d-none');
        btnDispatch.disabled = false;
    }
}

// 6. Handle Trip Creation
document.getElementById('createTripForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newTrip = {
        id: "TR00" + (mockTrips.length + 5), 
        source: document.getElementById('trip-source').value,
        dest: document.getElementById('trip-dest').value,
        vehicle: vehicleSelect.value,
        driver: driverSelect.value,
        status: "Dispatched"
    };

    const vIndex = mockVehicles.findIndex(v => v.regNo === newTrip.vehicle);
    if (vIndex > -1) mockVehicles[vIndex].status = "On Trip";

    const dIndex = mockDrivers.findIndex(d => d.name === newTrip.driver);
    if (dIndex > -1) mockDrivers[dIndex].status = "On Trip";

    mockTrips.unshift(newTrip);

    this.reset();
    validateDispatch();
    populateDropdowns();
    renderLiveBoard();

    if (typeof showToast === 'function') {
        showToast(`Trip ${newTrip.id} successfully dispatched!`, 'success');
    }
});

// 7. Render the Live Board
function renderLiveBoard() {
    liveBoard.innerHTML = "";

    mockTrips.forEach(trip => {
        let badgeColor = trip.status === "Dispatched" ? "bg-primary" : "bg-secondary";

        const card = `
            <div class="card border-secondary bg-transparent p-3">
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">${trip.id}</span>
                    <span class="text-muted small">${trip.vehicle} / ${trip.driver}</span>
                </div>
                <div class="fw-medium mb-3">${trip.source} &rarr; ${trip.dest}</div>
                <div>
                    <span class="badge ${badgeColor} px-3 py-2">${trip.status}</span>
                </div>
            </div>
        `;
        liveBoard.insertAdjacentHTML('beforeend', card);
    });
}