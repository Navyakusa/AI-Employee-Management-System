package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonRankingCandidateDto {

    @JsonProperty("resume_id")
    private String resumeId;

    private String role;

    private String seniority;

    private String industry;

    @JsonProperty("years_experience")
    private Double yearsExperience;

    private String education;

    private String skills;

    private String summary;

    @JsonProperty("experience_bullets")
    private String experienceBullets;
}