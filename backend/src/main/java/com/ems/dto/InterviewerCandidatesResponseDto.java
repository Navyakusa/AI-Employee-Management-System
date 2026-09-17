package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewerCandidatesResponseDto {

    private Long totalCandidates;

    private Long scheduledCandidates;

    private Long completedCandidates;

    private List<InterviewerCandidateDto> candidates;
}