package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateDecisionDto {

    private Long applicationId;

    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    private Long jobId;
    private String jobTitle;

    private String experience;

    // Interview evaluation score
    private Integer interviewScore;

    // AI matching score - will be populated when ML integration is connected
    private Double aiMatchPercentage;

    // Current application/decision status
    private String status;
}
