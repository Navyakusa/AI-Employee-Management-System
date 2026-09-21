package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateProfileUpdateDto {

    private String name;

    private String phone;

    private String location;

    private String education;

    private String experience;

    private String skills;

    private String linkedin;

    private String portfolio;

    private Double expectedSalary;

    private String noticePeriod;
}