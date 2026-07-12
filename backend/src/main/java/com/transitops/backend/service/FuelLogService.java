package com.transitops.backend.service;

import com.transitops.backend.entity.FuelLog;
import com.transitops.backend.exception.ResourceNotFoundException;
import com.transitops.backend.repository.FuelLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FuelLogService {

    private final FuelLogRepository repository;

    public FuelLogService(FuelLogRepository repository) {
        this.repository = repository;
    }

    public List<FuelLog> getAllFuelLogs() {
        return repository.findAll();
    }

    public FuelLog getFuelLogById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Fuel log not found with id " + id));
    }

    public FuelLog saveFuelLog(FuelLog fuelLog) {
        return repository.save(fuelLog);
    }

    public FuelLog updateFuelLog(Long id, FuelLog updatedFuelLog) {
        return repository.findById(id)
                .map(fuelLog -> {
                    fuelLog.setVehicle(updatedFuelLog.getVehicle());
                    fuelLog.setLiters(updatedFuelLog.getLiters());
                    fuelLog.setFuelCost(updatedFuelLog.getFuelCost());
                    fuelLog.setFuelDate(updatedFuelLog.getFuelDate());

                    return repository.save(fuelLog);
                })
                .orElseThrow(() -> new RuntimeException("Fuel log not found"));
    }

    public void deleteFuelLog(Long id) {
        repository.deleteById(id);
    }
}