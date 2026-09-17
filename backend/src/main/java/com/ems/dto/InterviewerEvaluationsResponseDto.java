package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewerEvaluationsResponseDto {

    private Long pendingCount;

    private Long submittedCount;

    private Long totalCount;

    private List<InterviewEvaluationDto> evaluations;
}