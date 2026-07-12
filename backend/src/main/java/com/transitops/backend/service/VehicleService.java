package com.transitops.backend.service;

import com.transitops.backend.entity.Vehicle;
import com.transitops.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> getVehicleById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateVehicle(Long id, Vehicle updatedVehicle) {
        return vehicleRepository.findById(id)
                .map(vehicle -> {
                    vehicle.setRegistrationNumber(updatedVehicle.getRegistrationNumber());
                    vehicle.setVehicleName(updatedVehicle.getVehicleName());
                    vehicle.setVehicleType(updatedVehicle.getVehicleType());
                    vehicle.setMaxLoadCapacity(updatedVehicle.getMaxLoadCapacity());
                    vehicle.setOdometer(updatedVehicle.getOdometer());
                    vehicle.setAcquisitionCost(updatedVehicle.getAcquisitionCost());
                    vehicle.setStatus(updatedVehicle.getStatus());

                    return vehicleRepository.save(vehicle);
                })
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}