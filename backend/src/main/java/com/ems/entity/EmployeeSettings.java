package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "employee_settings",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "employeeId")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long employeeId;

    @Column(nullable = false)
    private Boolean emailNotifications;

    @Column(nullable = false)
    private Boolean systemNotifications;

    @Column(nullable = false)
    private Boolean darkMode;
}