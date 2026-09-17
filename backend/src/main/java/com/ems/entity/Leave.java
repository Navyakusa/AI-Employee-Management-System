
package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Leave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Employee who applied for the leave
    @Column(nullable = false)
    private Long employeeId;

    // Casual Leave, Sick Leave, Annual Leave, etc.
    @Column(nullable = false)
    private String leaveType;

    // First day of leave
    @Column(nullable = false)
    private LocalDate fromDate;

    // Last day of leave
    @Column(nullable = false)
    private LocalDate toDate;

    // Number of leave days
    @Column(nullable = false)
    private Integer days;

    // Employee's reason
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    // PENDING / APPROVED / REJECTED
    @Column(nullable = false)
    private String status;

    // Date and time when employee applied
    @Column(nullable = false)
    private LocalDateTime appliedOn;
}