package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonMatchResponseDto {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("resume_id")
    private String resumeId;

    private String result;

    @JsonProperty("match_probability_pct")
    private Double matchProbabilityPct;

    private Map<String, Object> features;

    private List<Map<String, Object>> explanation;
}