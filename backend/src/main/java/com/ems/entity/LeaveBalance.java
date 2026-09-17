package com.ems.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "leave_balances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long employeeId;

    private Integer casualLeave;

    private Integer sickLeave;

    private Integer annualLeave;

    private Integer unpaidLeave;

    private Integer maternityLeave;

    private Integer paternityLeave;

    private Integer otherLeave;
}