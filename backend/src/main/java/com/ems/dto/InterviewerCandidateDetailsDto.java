
package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewerCandidateDetailsDto {

    private Long candidateId;
    private String name;
    private String email;
    private String phone;
    private String location;
    private String education;
    private String experience;
    private String skills;

    private Long resumeId;
    private String resume;

    private String linkedin;
    private String portfolio;

    private Double expectedSalary;
    private String noticePeriod;
    private String source;
    private LocalDateTime applicationDate;

    private Long jobId;
    private String appliedPosition;

    private Long interviewId;
    private LocalDateTime interviewDateTime;
    private String interviewMode;
    private String interviewStatus;

    private Double aiMatchScore;
    private String professionalSummary;
}
