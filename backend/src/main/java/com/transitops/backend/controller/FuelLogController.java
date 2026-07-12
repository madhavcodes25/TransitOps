package com.transitops.backend.controller;

import com.transitops.backend.entity.FuelLog;
import com.transitops.backend.service.FuelLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
public class FuelLogController {

    private final FuelLogService service;

    public FuelLogController(FuelLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<FuelLog> getAllFuelLogs() {
        return service.getAllFuelLogs();
    }

    @GetMapping("/{id}")
    public FuelLog getFuelLogById(@PathVariable Long id) {
        return service.getFuelLogById(id);
    }

    @PostMapping
    public FuelLog createFuelLog(@RequestBody FuelLog fuelLog) {
        return service.saveFuelLog(fuelLog);
    }

    @PutMapping("/{id}")
    public FuelLog updateFuelLog(@PathVariable Long id,
                                 @RequestBody FuelLog fuelLog) {
        return service.updateFuelLog(id, fuelLog);
    }

    @DeleteMapping("/{id}")
    public void deleteFuelLog(@PathVariable Long id) {
        service.deleteFuelLog(id);
    }
}