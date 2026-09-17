package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CandidateRankingResponseDto {

    private Long id;

    private Long candidateId;

    private Long jobId;

    private Double matchScore;

    private Integer rank;

    private String candidateRole;

    private Double mustHaveCoveragePct;

    private List<String> missingMustHave;
}