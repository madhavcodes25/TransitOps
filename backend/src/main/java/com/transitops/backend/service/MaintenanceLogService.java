package com.transitops.backend.service;

import com.transitops.backend.entity.MaintenanceLog;
import com.transitops.backend.repository.MaintenanceLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MaintenanceLogService {

    private final MaintenanceLogRepository repository;

    public MaintenanceLogService(MaintenanceLogRepository repository) {
        this.repository = repository;
    }

    public List<MaintenanceLog> getAllLogs() {
        return repository.findAll();
    }

    public Optional<MaintenanceLog> getLogById(Long id) {
        return repository.findById(id);
    }

    public MaintenanceLog saveLog(MaintenanceLog log) {
        return repository.save(log);
    }

    public MaintenanceLog updateLog(Long id, MaintenanceLog updatedLog) {
        return repository.findById(id)
                .map(log -> {
                    log.setVehicle(updatedLog.getVehicle());
                    log.setServiceType(updatedLog.getServiceType());
                    log.setCost(updatedLog.getCost());
                    log.setServiceDate(updatedLog.getServiceDate());
                    log.setStatus(updatedLog.getStatus());

                    return repository.save(log);
                })
                .orElseThrow(() -> new RuntimeException("Maintenance log not found"));
    }

    public void deleteLog(Long id) {
        repository.deleteById(id);
    }
}