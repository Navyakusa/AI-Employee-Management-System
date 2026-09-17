package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonInterviewQuestionDto {

    private String question;

    private String category;

    @JsonProperty("targets_skill")
    private String targetsSkill;
}