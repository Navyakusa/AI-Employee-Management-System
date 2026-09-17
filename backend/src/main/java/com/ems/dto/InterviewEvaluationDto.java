package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewEvaluationDto {

    private Long evaluationId;

    private Long interviewId;

    private Long candidateId;

    private String candidateName;

    private Long jobId;

    private String jobTitle;

    private LocalDateTime interviewDateTime;

    private Integer technicalSkills;

    private Integer communication;

    private Integer problemSolving;

    private Double overallRating;

    private String strengths;

    private String areasForImprovement;

    private String status;

    private LocalDateTime submittedAt;
}