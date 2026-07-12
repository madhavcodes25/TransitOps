package com.transitops.backend.service;

import com.transitops.backend.enums.DriverStatus;
import com.transitops.backend.enums.TripStatus;
import com.transitops.backend.enums.VehicleStatus;
import com.transitops.backend.repository.DriverRepository;
import com.transitops.backend.repository.MaintenanceLogRepository;
import com.transitops.backend.repository.TripRepository;
import com.transitops.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final MaintenanceLogRepository maintenanceRepository;

    public DashboardService(
            VehicleRepository vehicleRepository,
            DriverRepository driverRepository,
            TripRepository tripRepository,
            MaintenanceLogRepository maintenanceRepository) {

        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put("totalVehicles", vehicleRepository.count());

        dashboard.put(
                "availableVehicles",
                vehicleRepository.findAll()
                        .stream()
                        .filter(v -> v.getStatus() == VehicleStatus.AVAILABLE)
                        .count()
        );

        dashboard.put("totalDrivers", driverRepository.count());

        dashboard.put(
                "availableDrivers",
                driverRepository.findAll()
                        .stream()
                        .filter(d -> d.getStatus() == DriverStatus.AVAILABLE)
                        .count()
        );

        dashboard.put(
                "activeTrips",
                tripRepository.findAll()
                        .stream()
                        .filter(t -> t.getStatus() == TripStatus.DISPATCHED)
                        .count()
        );

        dashboard.put(
                "maintenanceLogs",
                maintenanceRepository.count()
        );

        return dashboard;
    }
}