package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonInterviewQuestionRequestDto {

    private PythonRankingJobDto job;

    @JsonProperty("resume")
    private PythonRankingCandidateDto resume;

    @JsonProperty("num_questions")
    private Integer numQuestions;

    private String provider;
}