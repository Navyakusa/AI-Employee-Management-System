package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttritionPredictionResponseDto {

    @JsonProperty("attrition_probability_pct")
    private Double attritionProbabilityPct;

    @JsonProperty("risk_level")
    private String riskLevel;
}