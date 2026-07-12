const API_BASE_URL = 'http://localhost:8080';

// --- Enum label mappings ---

const VEHICLE_STATUS_LABELS = {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    IN_SHOP: 'In Shop',
    RETIRED: 'Retired'
};

const VEHICLE_TYPE_LABELS = {
    VAN: 'Van',
    TRUCK: 'Truck',
    MINI_TRUCK: 'Mini',
    BUS: 'Bus',
    OTHER: 'Other'
};

const DRIVER_STATUS_LABELS = {
    AVAILABLE: 'Available',
    ON_TRIP: 'On Trip',
    OFF_DUTY: 'Off Duty',
    SUSPENDED: 'Suspended'
};

const TRIP_STATUS_LABELS = {
    DRAFT: 'Draft',
    DISPATCHED: 'Dispatched',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
};

const MAINTENANCE_STATUS_LABELS = {
    ACTIVE: 'Active',
    COMPLETED: 'Completed'
};

const ROLE_LABELS = {
    ADMIN: 'Admin',
    FLEET_MANAGER: 'Fleet Manager',
    DISPATCHER: 'Dispatcher',
    SAFETY_OFFICER: 'Safety Officer',
    FINANCIAL_ANALYST: 'Financial Analyst'
};

// --- Formatting helpers ---

function formatEnumLabel(value, labels) {
    return labels[value] || value;
}

function parseVehicleType(label) {
    const map = { Van: 'VAN', Truck: 'TRUCK', Mini: 'MINI_TRUCK', Bus: 'BUS', Other: 'OTHER' };
    return map[label] || 'OTHER';
}

function parseVehicleStatus(label) {
    const map = { Available: 'AVAILABLE', 'On Trip': 'ON_TRIP', 'In Shop': 'IN_SHOP', Retired: 'RETIRED' };
    return map[label] || 'AVAILABLE';
}

function parseDriverStatus(label) {
    const map = { Available: 'AVAILABLE', 'On Trip': 'ON_TRIP', 'Off Duty': 'OFF_DUTY', Suspended: 'SUSPENDED' };
    return map[label] || 'AVAILABLE';
}

function parseMaintenanceStatus(label) {
    const map = { Active: 'ACTIVE', Completed: 'COMPLETED' };
    return map[label] || 'ACTIVE';
}

function formatNumber(num) {
    if (num == null || isNaN(num)) return '-';
    return Math.round(num).toLocaleString('en-IN');
}

function formatCapacity(kg) {
    if (kg == null) return '-';
    if (kg >= 1000) return (kg / 1000) + ' Ton';
    return kg + ' kg';
}

function parseCapacity(str) {
    if (!str) return 0;
    const lower = str.toLowerCase().trim();
    const num = parseFloat(lower.replace(/[^0-9.]/g, '')) || 0;
    if (lower.includes('ton')) return num * 1000;
    return num;
}

function parseCost(str) {
    if (!str || str === '-') return 0;
    return parseFloat(str.replace(/[^0-9.]/g, '')) || 0;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options).replace(',', '');
}

function formatExpiryDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const monthsLeft = (date.getFullYear() - now.getFullYear()) * 12 + (date.getMonth() - now.getMonth());
    const formatted = (date.getMonth() + 1).toString().padStart(2, '0') + '/' + date.getFullYear();
    if (monthsLeft <= 3 && monthsLeft >= 0) return formatted + ' EXPIRING';
    return formatted;
}

function safetyLabel(score) {
    if (score == null) return 'N/A';
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'At Risk';
}

function getVehicleReg(vehicle) {
    return vehicle?.registrationNumber || vehicle?.vehicleName || '-';
}

// --- API request helper ---

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('transitops_token');
    const headers = { 'Content-Type': 'application/json', ...options.headers };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    const response = await fetch(API_BASE_URL + endpoint, { ...options, headers });

    if (response.status === 401) {
        localStorage.removeItem('transitops_token');
        localStorage.removeItem('transitops_role');
        localStorage.removeItem('transitops_user');
        window.location.href = 'login.html';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        let message = 'Request failed';
        try {
            const err = await response.json();
            message = err.message || message;
        } catch (_) { /* ignore */ }
        throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
}

// --- Entity mappers (backend → UI) ---

function mapVehicle(v) {
    return {
        id: v.id,
        regNo: v.registrationNumber,
        model: v.vehicleName,
        type: formatEnumLabel(v.vehicleType, VEHICLE_TYPE_LABELS),
        capacity: formatCapacity(v.maxLoadCapacity),
        capacityKg: v.maxLoadCapacity,
        odometer: formatNumber(v.odometer),
        cost: v.acquisitionCost ? formatNumber(v.acquisitionCost) : '-',
        status: formatEnumLabel(v.status, VEHICLE_STATUS_LABELS),
        _raw: v
    };
}

function mapDriver(d) {
    return {
        id: d.id,
        name: d.name,
        license: d.licenseNumber,
        category: d.licenseCategory,
        expiry: formatExpiryDate(d.licenseExpiryDate),
        contact: d.contactNumber,
        safety: safetyLabel(d.safetyScore),
        safetyScore: d.safetyScore,
        status: formatEnumLabel(d.status, DRIVER_STATUS_LABELS),
        _raw: d
    };
}

function mapTrip(t) {
    return {
        id: t.tripNumber || ('TR-' + t.id),
        dbId: t.id,
        source: t.source,
        dest: t.destination,
        vehicle: getVehicleReg(t.vehicle),
        driver: t.driver?.name || '-',
        status: formatEnumLabel(t.status, TRIP_STATUS_LABELS),
        eta: t.status === 'DISPATCHED' ? 'In transit' : (t.status === 'COMPLETED' ? '-' : 'Awaiting vehicle'),
        _raw: t
    };
}

function mapFuelLog(f) {
    return {
        id: f.id,
        vehicle: getVehicleReg(f.vehicle),
        vehicleId: f.vehicle?.id,
        date: formatDate(f.fuelDate),
        liters: f.liters,
        cost: f.fuelCost,
        _raw: f
    };
}

function mapMaintenanceLog(m) {
    return {
        id: m.id,
        vehicle: getVehicleReg(m.vehicle),
        vehicleId: m.vehicle?.id,
        service: m.serviceType,
        date: m.serviceDate,
        cost: formatNumber(m.cost),
        status: formatEnumLabel(m.status, MAINTENANCE_STATUS_LABELS),
        _raw: m
    };
}

function aggregateExpenses(expenses) {
    const byTrip = {};

    expenses.forEach(exp => {
        const tripNum = exp.trip?.tripNumber || ('TR-' + exp.trip?.id);
        if (!byTrip[tripNum]) {
            byTrip[tripNum] = {
                id: exp.trip?.id,
                trip: tripNum,
                vehicle: getVehicleReg(exp.trip?.vehicle),
                toll: 0,
                other: 0,
                maintLinked: 0
            };
        }
        if (exp.expenseType === 'TOLL') byTrip[tripNum].toll += exp.amount;
        else if (exp.expenseType === 'MAINTENANCE') byTrip[tripNum].maintLinked += exp.amount;
        else byTrip[tripNum].other += exp.amount;
    });

    return Object.values(byTrip);
}

// --- API methods ---

const API = {
    login(email, password) {
        return apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    getDashboard() {
        return apiRequest('/api/dashboard');
    },

    getAnalytics() {
        return apiRequest('/api/analytics');
    },

    getVehicles() {
        return apiRequest('/api/vehicles').then(data => data.map(mapVehicle));
    },

    createVehicle(formData) {
        const payload = {
            registrationNumber: formData.regNo,
            vehicleName: formData.model,
            region: formData.region || 'GJ4',
            vehicleType: parseVehicleType(formData.type),
            maxLoadCapacity: parseCapacity(formData.capacity),
            odometer: parseCost(formData.odometer),
            acquisitionCost: parseCost(formData.cost),
            status: 'AVAILABLE'
        };
        return apiRequest('/api/vehicles', { method: 'POST', body: JSON.stringify(payload) });
    },

    getDrivers() {
        return apiRequest('/api/drivers').then(data => data.map(mapDriver));
    },

    createDriver(formData) {
        const payload = {
            name: formData.name,
            licenseNumber: formData.license,
            licenseCategory: formData.category,
            licenseExpiryDate: formData.expiry,
            contactNumber: formData.contact,
            email: formData.email,
            safetyScore: 95.0,
            status: 'AVAILABLE'
        };
        return apiRequest('/api/drivers', { method: 'POST', body: JSON.stringify(payload) });
    },

    getTrips() {
        return apiRequest('/api/trips').then(data => data.map(mapTrip));
    },

    createTrip(formData) {
        const payload = {
            tripNumber: 'TR-' + Date.now(),
            source: formData.source,
            destination: formData.dest,
            vehicle: { id: parseInt(formData.vehicleId) },
            driver: { id: parseInt(formData.driverId) },
            cargoWeight: parseFloat(formData.cargoWeight),
            plannedDistance: parseFloat(formData.plannedDistance),
            dispatchDate: new Date().toISOString().split('T')[0],
            status: 'DISPATCHED'
        };
        return apiRequest('/api/trips', { method: 'POST', body: JSON.stringify(payload) });
    },

    getFuelLogs() {
        return apiRequest('/api/fuel').then(data => data.map(mapFuelLog));
    },

    createFuelLog(formData) {
        const payload = {
            vehicle: { id: parseInt(formData.vehicleId) },
            liters: parseFloat(formData.liters),
            fuelCost: parseFloat(formData.cost),
            fuelDate: formData.date,
            odometerReading: parseFloat(formData.odometer) || 0
        };
        return apiRequest('/api/fuel', { method: 'POST', body: JSON.stringify(payload) });
    },

    getExpenses() {
        return apiRequest('/api/expenses').then(aggregateExpenses);
    },

    createExpenses(formData) {
        const tripId = parseInt(formData.tripId);
        const promises = [];

        if (formData.toll > 0) {
            promises.push(apiRequest('/api/expenses', {
                method: 'POST',
                body: JSON.stringify({ trip: { id: tripId }, expenseType: 'TOLL', amount: formData.toll, description: 'Toll charges' })
            }));
        }
        if (formData.other > 0) {
            promises.push(apiRequest('/api/expenses', {
                method: 'POST',
                body: JSON.stringify({ trip: { id: tripId }, expenseType: 'OTHER', amount: formData.other, description: 'Miscellaneous' })
            }));
        }
        return Promise.all(promises);
    },

    getMaintenanceLogs() {
        return apiRequest('/api/maintenance').then(data => data.map(mapMaintenanceLog));
    },

    createMaintenanceLog(formData) {
        const payload = {
            vehicle: { id: parseInt(formData.vehicleId) },
            serviceType: formData.service,
            cost: parseFloat(formData.cost),
            serviceDate: formData.date,
            status: parseMaintenanceStatus(formData.status)
        };
        return apiRequest('/api/maintenance', { method: 'POST', body: JSON.stringify(payload) });
    },

    completeMaintenanceLog(id) {
        return apiRequest('/api/maintenance/' + id).then(log => {
            const payload = {
                vehicle: { id: log.vehicle.id },
                serviceType: log.serviceType,
                cost: log.cost,
                serviceDate: log.serviceDate,
                completionDate: new Date().toISOString().split('T')[0],
                status: 'COMPLETED',
                remarks: log.remarks || ''
            };
            return apiRequest('/api/maintenance/' + id, { method: 'PUT', body: JSON.stringify(payload) });
        });
    },

    getVehiclesRaw() {
        return apiRequest('/api/vehicles');
    },

    getTripsRaw() {
        return apiRequest('/api/trips');
    }
};
