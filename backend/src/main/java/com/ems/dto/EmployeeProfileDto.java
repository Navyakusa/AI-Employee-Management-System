package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeProfileDto {

    private Long employeeId;

    private String employeeCode;

    private String name;

    private String email;

    private String phone;

    private String department;

    private String designation;

    private String manager;

    private String location;

    private String employmentType;

    private String status;
}