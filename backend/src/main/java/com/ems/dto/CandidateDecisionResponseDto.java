package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDecisionResponseDto {

    private Long jobId;

    private Long candidateId;

    private Double matchProbabilityPct;

    private Double interviewAverageScore;

    private Double combinedScorePct;

    private String recommendation;

    private String rationale;

    private String note;
}