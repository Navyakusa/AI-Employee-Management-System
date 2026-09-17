package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonDecisionRequestDto {

    @JsonProperty("match_probability_pct")
    private Double matchProbabilityPct;

    @JsonProperty("interview_feedback")
    private PythonDecisionFeedbackDto interviewFeedback;
}