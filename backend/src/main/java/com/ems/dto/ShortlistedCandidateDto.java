package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShortlistedCandidateDto {
    private Long candidateId;
    private Long jobId;
    private Long applicationId;
    private String candidateName;
    private String email;
    private String jobTitle;
    private String department;
    private String location;
    private String requiredSkills;
    private String status;
    private LocalDateTime appliedAt;
    private String experience;
    private String skills;

    // AI
    private Double aiMatchScore;

    // Resume
    private Long resumeId;
    private String resumeFileName;
}
