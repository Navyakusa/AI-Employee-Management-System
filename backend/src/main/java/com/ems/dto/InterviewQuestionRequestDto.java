package com.ems.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InterviewQuestionRequestDto {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;

    @Min(value = 1, message = "Minimum 1 question is required")
    @Max(value = 20, message = "Maximum 20 questions are allowed")
    private Integer numQuestions = 5;
}