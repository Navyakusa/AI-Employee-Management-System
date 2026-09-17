package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDashboardJobDto {

    private Long jobId;

    private String title;

    private String department;

    private String location;

    private String employmentType;

    private Integer experienceMin;

    private Integer experienceMax;

    private Double salaryMin;

    private Double salaryMax;

    private String requiredSkills;

    private String preferredSkills;

    private String education;

    private String description;

    private String responsibilities;

    private Integer openings;

    private String status;
}