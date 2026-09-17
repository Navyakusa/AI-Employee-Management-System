package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceSummaryDto {

    private Double overallScore;
    private LocalDate reviewDate;
    private String reviewStatus;
    private Double previousScore;
    private Integer totalReviews;
    private List<PerformanceSkillDto> skills;
}