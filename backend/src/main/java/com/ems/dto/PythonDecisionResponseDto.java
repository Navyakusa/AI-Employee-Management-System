package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonDecisionResponseDto {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("resume_id")
    private String resumeId;

    @JsonProperty("match_probability_pct")
    private Double matchProbabilityPct;

    @JsonProperty("interview_average_score")
    private Double interviewAverageScore;

    @JsonProperty("combined_score_pct")
    private Double combinedScorePct;

    private String recommendation;

    private String rationale;

    private String note;
}