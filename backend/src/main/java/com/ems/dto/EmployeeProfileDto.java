package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileDto {

    private Long employeeId;

    private String employeeCode;

    private String name;

    private String email;

    private String department;

    private String designation;

    private String manager;

    private String location;

    private String employmentType;

    private String status;
}