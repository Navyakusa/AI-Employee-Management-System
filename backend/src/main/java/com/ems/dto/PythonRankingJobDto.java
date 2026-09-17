package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonRankingJobDto {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("job_title")
    private String jobTitle;

    private String seniority;

    private String industry;

    @JsonProperty("must_have_skills")
    private String mustHaveSkills;

    @JsonProperty("nice_to_have_skills")
    private String niceToHaveSkills;

    private String description;

    private String responsibilities;

    private String requirements;
}