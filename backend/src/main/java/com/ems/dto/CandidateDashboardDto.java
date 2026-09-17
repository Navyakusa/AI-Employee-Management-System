package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateDashboardDto {

    private Long candidateId;

    private String candidateName;

    private String email;

    private long totalApplications;

    private long upcomingInterviews;

    private long totalOffers;

    private int profileCompletionPercentage;

    private List<CandidateDashboardApplicationDto> recentApplications;

    private CandidateDashboardInterviewDto upcomingInterview;

    private List<CandidateDashboardJobDto> recommendedJobs;
}