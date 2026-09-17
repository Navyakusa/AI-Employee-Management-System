package com.ems.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CandidateDecisionRequestDto {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotNull(message = "Candidate ID is required")
    private Long candidateId;
}