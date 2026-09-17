package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonInterviewQuestionResponseDto {

    @JsonProperty("job_id")
    private String jobId;

    @JsonProperty("resume_id")
    private String resumeId;

    private String source;

    private List<PythonInterviewQuestionDto> questions;
}