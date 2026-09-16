package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonSkillGapResponseDto {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("resume_id")
    private String resumeId;

    @JsonProperty("must_have_coverage_pct")
    private Double mustHaveCoveragePct;

    @JsonProperty("nice_to_have_coverage_pct")
    private Double niceToHaveCoveragePct;

    @JsonProperty("missing_must_have")
    private List<String> missingMustHave;

    @JsonProperty("missing_nice_to_have")
    private List<String> missingNiceToHave;
}