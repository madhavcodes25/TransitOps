// 1. Mock Master Data
const mockVehicles = [
    { regNo: "GJ01AB452", model: "VAN-05", type: "Van", capacity: "500 kg", odometer: "74,000", cost: "6,20,000", status: "Available" },
    { regNo: "GJ01AB998", model: "TRUCK-11", type: "Truck", capacity: "5 Ton", odometer: "182,000", cost: "24,50,000", status: "On Trip" },
    { regNo: "GJ01AB1120", model: "MINI-03", type: "Mini", capacity: "1 Ton", odometer: "66,000", cost: "4,10,000", status: "In Shop" },
    { regNo: "GJ01AB008", model: "VAN-09", type: "Van", capacity: "750 kg", odometer: "241,900", cost: "-", status: "Retired" }
];

// 2. Initialization
document.addEventListener("DOMContentLoaded", () => {
    renderVehicles(mockVehicles);
});

// 3. Render Function
function renderVehicles(data) {
    const tbody = document.getElementById("vehicle-table-body");
    tbody.innerHTML = ""; // Clear existing rows

    data.forEach(vehicle => {
        // Assign the correct Bootstrap badge color based on status
        let badgeClass = "";
        switch (vehicle.status) {
            case "Available": badgeClass = "bg-success"; break;
            case "On Trip": badgeClass = "bg-primary"; break;
            case "In Shop": badgeClass = "bg-warning text-dark"; break;
            case "Retired": badgeClass = "bg-danger"; break;
        }

        // Build the HTML string
        const row = `
            <tr>
                <td class="fw-medium">${vehicle.regNo}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.type}</td>
                <td>${vehicle.capacity}</td>
                <td>${vehicle.odometer}</td>
                <td>${vehicle.cost}</td>
                <td><span class="badge ${badgeClass} w-100 py-2">${vehicle.status}</span></td>
            </tr>
        `;

        // Inject into the DOM
        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// 4. Handle Form Submission & Validation
document.getElementById('addVehicleForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent page reload

    const regInput = document.getElementById('new-reg').value.toUpperCase().trim();
    const errorAlert = document.getElementById('reg-error');

    // Business Rule: Validate Unique Registration Number
    const exists = mockVehicles.some(v => v.regNo.toUpperCase() === regInput);

    if (exists) {
        // Show error and stop submission
        errorAlert.classList.remove('d-none');
        return;
    }

    // Hide error if previously shown
    errorAlert.classList.add('d-none');

    // Create the new vehicle object
    const newVehicle = {
        regNo: regInput,
        model: document.getElementById('new-model').value.toUpperCase(),
        type: document.getElementById('new-type').value,
        capacity: document.getElementById('new-capacity').value,
        odometer: document.getElementById('new-odo').value || "0",
        cost: document.getElementById('new-cost').value || "-",
        status: "Available" // New vehicles are available by default
    };

    // Add to our mock array
    mockVehicles.push(newVehicle);

    // Re-render the table with the new data
    renderVehicles(mockVehicles);

    // Close the modal and reset the form
    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addVehicleModal'));
    modalInstance.hide();
    this.reset();
});