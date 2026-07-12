// 1. Mock Data (Matches your POC)
const mockDrivers = [
    { id: 1, name: "Alex", license: "DL-88213", category: "LMV", expiry: "12/2027", contact: "98765xxxxx", safety: "Available", status: "Available" },
    { id: 2, name: "John", license: "DL-44120", category: "HMV", expiry: "03/2025 EXPIRING", contact: "98220xxxxx", safety: "Suspended", status: "Suspended" },
    { id: 3, name: "Priya", license: "DL-77031", category: "LMV", expiry: "08/2028", contact: "97111xxxxx", safety: "On Trip", status: "On Trip" },
    { id: 4, name: "Suresh", license: "DL-90045", category: "HMV", expiry: "01/2027", contact: "97440xxxxx", safety: "Available", status: "Off Duty" }
];

document.addEventListener("DOMContentLoaded", () => {
    renderDrivers(mockDrivers);
});

// 2. Render Function
function renderDrivers(data) {
    const tbody = document.getElementById("driver-table-body");
    tbody.innerHTML = "";

    data.forEach(driver => {
        // Status Badge Mapping
        let statusBadge = "bg-success";
        if (driver.status === "On Trip") statusBadge = "bg-primary";
        if (driver.status === "Suspended") statusBadge = "bg-danger";
        if (driver.status === "Off Duty") statusBadge = "bg-secondary";

        // Safety Badge Mapping (Simplifying to match mockup colors)
        let safetyBadge = driver.safety === "Suspended" ? "bg-danger" :
            driver.safety === "On Trip" ? "bg-primary" : "bg-success";

        // Highlight expiring licenses
        let expiryText = driver.expiry.includes("EXPIRING") ? `<span class="text-danger fw-bold">${driver.expiry}</span>` : driver.expiry;

        const row = `
            <tr>
                <td class="fw-medium">${driver.name}</td>
                <td class="text-uppercase">${driver.license}</td>
                <td>${driver.category}</td>
                <td>${expiryText}</td>
                <td>${driver.contact}</td>
                <td><span class="badge ${safetyBadge} w-100 py-2">${driver.safety}</span></td>
                <td><span class="badge ${statusBadge} w-100 py-2">${driver.status}</span></td>
            </tr>
        `;

        tbody.insertAdjacentHTML('beforeend', row);
    });
}

// 3. Form Submission Handling
document.getElementById('addDriverForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const newDriver = {
        id: mockDrivers.length + 1,
        name: document.getElementById('new-name').value,
        license: document.getElementById('new-license').value.toUpperCase(),
        category: document.getElementById('new-category').value,
        // Basic date formatting for UI purposes
        expiry: document.getElementById('new-expiry').value,
        contact: document.getElementById('new-contact').value,
        safety: "Available",
        status: "Available"
    };

    mockDrivers.push(newDriver);
    renderDrivers(mockDrivers);

    const modalInstance = bootstrap.Modal.getInstance(document.getElementById('addDriverModal'));
    modalInstance.hide();
    this.reset();
});