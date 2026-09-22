package com.ems.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedbackDto {

    private Long interviewId;

    private Integer technicalRating;

    private Integer communicationRating;

    private Integer problemSolvingRating;

    private Integer overallRating;

    private String strengths;

    private String improvementAreas;

    private String feedback;

    private String recommendation;

    // Kept for compatibility with existing frontend/backend
    private Integer rating;
}