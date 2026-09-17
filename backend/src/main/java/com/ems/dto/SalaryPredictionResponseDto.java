package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SalaryPredictionResponseDto {

    @JsonProperty("estimated_range_lpa")
    private String estimatedRangeLpa;

    @JsonProperty("lower_bound_lpa")
    private Double lowerBoundLpa;

    @JsonProperty("upper_bound_lpa")
    private Double upperBoundLpa;
}