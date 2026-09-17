package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class AIResumeScreeningResponseDto {

    private Long id;
    private Long candidateId;
    private Long jobId;
    private String skills;
    private String experience;
    private String education;
    private String certifications;
    private String jobTitles;
    private String companies;
    private String technologies;
    private String projects;
    private Double yearsOfExperience;
    private Double screeningScore;
    private String screeningResult;
    private String recommendation;
    private LocalDateTime screenedAt;
}