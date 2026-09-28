package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

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

    private Integer interviewScore;

    private Double aiMatchPercentage;

    private String status;

    // =========================================================
    // INTERVIEW INFORMATION
    // =========================================================

    private Long interviewId;

    private String interviewStatus;

    private String interviewRecommendation;

    private String interviewFeedback;

    private LocalDateTime interviewDateTime;

    private LocalDateTime appliedAt;
}