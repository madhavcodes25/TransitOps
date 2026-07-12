let allVehicles = [];
let allDrivers = [];
let allTrips = [];

const vehicleSelect = document.getElementById('trip-vehicle');
const driverSelect = document.getElementById('trip-driver');
const weightInput = document.getElementById('trip-weight');
const btnDispatch = document.getElementById('btn-dispatch');
const errorAlert = document.getElementById('capacity-error');
const maxCapDisplay = document.getElementById('max-cap-display');
const overageDisplay = document.getElementById('overage-display');
const liveBoard = document.getElementById('live-board-container');

document.addEventListener("DOMContentLoaded", async () => {
    await loadAll();

    vehicleSelect.addEventListener('change', validateDispatch);
    weightInput.addEventListener('input', validateDispatch);

    document.getElementById('btn-cancel').addEventListener('click', () => {
        document.getElementById('createTripForm').reset();
        validateDispatch();
    });
});

async function loadAll() {
    try {
        const [vRes, dRes, tRes] = await Promise.all([
            fetch("/api/vehicles", { headers: authHeaders() }),
            fetch("/api/drivers", { headers: authHeaders() }),
            fetch("/api/trips", { headers: authHeaders() })
        ]);

        if (vRes.status === 401 || dRes.status === 401 || tRes.status === 401) {
            logout();
            return;
        }

        allVehicles = await vRes.json();
        allDrivers = await dRes.json();
        allTrips = await tRes.json();

        populateDropdowns();
        renderLiveBoard();

    } catch (err) {
        console.error("Failed to load trips data:", err);
    }
}

function populateDropdowns() {
    vehicleSelect.innerHTML = '<option value="">Select a vehicle...</option>';
    driverSelect.innerHTML = '<option value="">Select a driver...</option>';

    const availableVehicles = allVehicles.filter(v => v.status === "AVAILABLE");
    const availableDrivers = allDrivers.filter(d => d.status === "AVAILABLE");

    availableVehicles.forEach(v => {
        vehicleSelect.insertAdjacentHTML('beforeend',
            `<option value="${v.id}" data-cap="${v.maxLoadCapacity}">${v.registrationNumber} - ${v.maxLoadCapacity} kg</option>`);
    });

    availableDrivers.forEach(d => {
        driverSelect.insertAdjacentHTML('beforeend', `<option value="${d.id}">${d.name}</option>`);
    });
}

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

document.getElementById('createTripForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const tripNumber = "TR" + Date.now().toString().slice(-6);

    const newTrip = {
        tripNumber: tripNumber,
        source: document.getElementById('trip-source').value,
        destination: document.getElementById('trip-dest').value,
        vehicle: { id: parseInt(vehicleSelect.value) },
        driver: { id: parseInt(driverSelect.value) },
        cargoWeight: parseFloat(weightInput.value),
        plannedDistance: parseFloat(document.getElementById('trip-distance').value),
        dispatchDate: new Date().toISOString().split('T')[0],
        status: "DISPATCHED"
    };

    try {
        const res = await fetch("/api/trips", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify(newTrip)
        });

        if (res.status === 401) {
            logout();
            return;
        }

        if (!res.ok) {
            if (typeof showToast === 'function') {
                showToast("Failed to dispatch trip. Check the form and try again.", 'danger');
            }
            return;
        }

        // Refresh everything so vehicle/driver availability and the live board reflect the new trip
        await loadAll();

        this.reset();
        validateDispatch();

        if (typeof showToast === 'function') {
            showToast(`Trip ${tripNumber} successfully dispatched!`, 'success');
        }

    } catch (err) {
        console.error("Failed to create trip:", err);
        if (typeof showToast === 'function') {
            showToast("Network error - couldn't reach the server.", 'danger');
        }
    }
});

function renderLiveBoard() {
    liveBoard.innerHTML = "";

    const sorted = [...allTrips].sort((a, b) => new Date(b.dispatchDate) - new Date(a.dispatchDate));

    sorted.forEach(trip => {
        let badgeColor = trip.status === "DISPATCHED" ? "bg-primary" :
            trip.status === "COMPLETED" ? "bg-success" :
                trip.status === "CANCELLED" ? "bg-danger" : "bg-secondary";

        const statusLabel = trip.status.charAt(0) + trip.status.slice(1).toLowerCase();
        const vehicleLabel = trip.vehicle ? trip.vehicle.registrationNumber : "-";
        const driverLabel = trip.driver ? trip.driver.name : "-";

        const card = `
            <div class="card border-secondary bg-transparent p-3">
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">${trip.tripNumber}</span>
                    <span class="text-muted small">${vehicleLabel} / ${driverLabel}</span>
                </div>
                <div class="fw-medium mb-3">${trip.source} &rarr; ${trip.destination}</div>
                <div>
                    <span class="badge ${badgeColor} px-3 py-2">${statusLabel}</span>
                </div>
            </div>
        `;
        liveBoard.insertAdjacentHTML('beforeend', card);
    });
}