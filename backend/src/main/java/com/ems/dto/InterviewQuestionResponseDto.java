package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionResponseDto {

    private Long jobId;

    private Long candidateId;

    private String source;

    private List<PythonInterviewQuestionDto> questions;
}