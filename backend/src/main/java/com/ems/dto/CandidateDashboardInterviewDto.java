package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDashboardInterviewDto {

    private Long interviewId;

    private Long jobId;

    private LocalDateTime interviewDateTime;

    private String interviewMode;

    private String meetingLink;

    private String location;

    private String notes;

    private String status;
}