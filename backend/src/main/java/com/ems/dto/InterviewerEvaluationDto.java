package com.ems.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewerEvaluationDto {

    private Long interviewId;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private Long jobId;

    private String jobTitle;

    private LocalDateTime interviewDateTime;

    private String interviewMode;

    private String interviewStatus;

    private Long feedbackId;

    private Integer technicalRating;

    private Integer communicationRating;

    private Integer problemSolvingRating;

    private Integer overallRating;

    private String strengths;

    private String improvementAreas;

    private String feedback;

    private String recommendation;

    private String evaluationStatus;

    private LocalDateTime submittedAt;
}