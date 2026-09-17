package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonRankingResponseDto {

    private Integer rank;

    @JsonProperty("resume_id")
    private String resumeId;

    @JsonProperty("candidate_role")
    private String candidateRole;

    @JsonProperty("match_probability_pct")
    private Double matchProbabilityPct;

    @JsonProperty("must_have_coverage_pct")
    private Double mustHaveCoveragePct;

    @JsonProperty("missing_must_have")
    private List<String> missingMustHave;
}