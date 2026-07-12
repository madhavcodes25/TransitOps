package com.transitops.backend.service;

import com.transitops.backend.entity.Trip;
import com.transitops.backend.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TripService {

    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Optional<Trip> getTripById(Long id) {
        return tripRepository.findById(id);
    }

    public Trip saveTrip(Trip trip) {
        return tripRepository.save(trip);
    }

    public Trip updateTrip(Long id, Trip updatedTrip) {
        return tripRepository.findById(id)
                .map(trip -> {
                    trip.setTripNumber(updatedTrip.getTripNumber());
                    trip.setSource(updatedTrip.getSource());
                    trip.setDestination(updatedTrip.getDestination());
                    trip.setVehicle(updatedTrip.getVehicle());
                    trip.setDriver(updatedTrip.getDriver());
                    trip.setCargoWeight(updatedTrip.getCargoWeight());
                    trip.setPlannedDistance(updatedTrip.getPlannedDistance());
                    trip.setStatus(updatedTrip.getStatus());

                    return tripRepository.save(trip);
                })
                .orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public void deleteTrip(Long id) {
        tripRepository.deleteById(id);
    }
}