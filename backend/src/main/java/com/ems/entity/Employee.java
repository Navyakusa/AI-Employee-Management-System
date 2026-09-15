package com.ems.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "employees")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeId;

    private String name;

    private String email;

    private String department;

    private String designation;

    private LocalDate joiningDate;

    private String manager;

    private String location;

    private String employmentType;

    private String status;
}