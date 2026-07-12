package com.transitops.backend.entity;

import com.transitops.backend.enums.DriverStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "drivers")
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String licenseNumber;

    @Column(nullable = false, length = 50)
    private String licenseCategory;

    @Column(nullable = false)
    private LocalDate licenseExpiryDate;

    @Column(nullable = false, length = 15)
    private String contactNumber;

    @Column(nullable = false)
    private Double safetyScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DriverStatus status;
}