package com.ems.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InterviewEvaluationRequestDto {

    @NotNull
    @Min(1)
    @Max(5)
    private Integer technicalSkills;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer communication;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer problemSolving;

    private Double overallRating;

    private String strengths;

    private String areasForImprovement;
}