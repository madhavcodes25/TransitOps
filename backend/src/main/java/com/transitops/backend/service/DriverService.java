package com.transitops.backend.service;

import com.transitops.backend.entity.Driver;
import com.transitops.backend.repository.DriverRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    public Optional<Driver> getDriverById(Long id) {
        return driverRepository.findById(id);
    }

    public Driver saveDriver(Driver driver) {
        return driverRepository.save(driver);
    }

    public Driver updateDriver(Long id, Driver updatedDriver) {
        return driverRepository.findById(id)
                .map(driver -> {
                    driver.setName(updatedDriver.getName());
                    driver.setLicenseNumber(updatedDriver.getLicenseNumber());
                    driver.setLicenseCategory(updatedDriver.getLicenseCategory());
                    driver.setLicenseExpiryDate(updatedDriver.getLicenseExpiryDate());
                    driver.setContactNumber(updatedDriver.getContactNumber());
                    driver.setSafetyScore(updatedDriver.getSafetyScore());
                    driver.setStatus(updatedDriver.getStatus());

                    return driverRepository.save(driver);
                })
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}