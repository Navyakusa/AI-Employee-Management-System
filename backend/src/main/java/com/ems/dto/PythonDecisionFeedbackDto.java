package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonDecisionFeedbackDto {

    @JsonProperty("technical_skills")
    private Double technicalSkills;

    private Double communication;

    @JsonProperty("problem_solving")
    private Double problemSolving;

    private Double teamwork;

    private Double leadership;
}