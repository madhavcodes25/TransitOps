package com.transitops.backend.controller;

import com.transitops.backend.entity.MaintenanceLog;
import com.transitops.backend.service.MaintenanceLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceLogController {

    private final MaintenanceLogService service;

    public MaintenanceLogController(MaintenanceLogService service) {
        this.service = service;
    }

    @GetMapping
    public List<MaintenanceLog> getAllLogs() {
        return service.getAllLogs();
    }

    @GetMapping("/{id}")
    public MaintenanceLog getLog(@PathVariable Long id) {
        return service.getLogById(id);
    }

    @PostMapping
    public MaintenanceLog createLog(@RequestBody MaintenanceLog log) {
        return service.saveLog(log);
    }

    @PutMapping("/{id}")
    public MaintenanceLog updateLog(@PathVariable Long id,
                                    @RequestBody MaintenanceLog log) {
        return service.updateLog(id, log);
    }

    @DeleteMapping("/{id}")
    public void deleteLog(@PathVariable Long id) {
        service.deleteLog(id);
    }
}