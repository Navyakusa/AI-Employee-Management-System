package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceResponseDto {

    private Long id;
    private Long employeeId;
    private String reviewPeriod;
    private LocalDate reviewDate;
    private Double overallScore;
    private String status;
    private String reviewer;
    private String comments;
    private List<PerformanceSkillDto> skills;
}