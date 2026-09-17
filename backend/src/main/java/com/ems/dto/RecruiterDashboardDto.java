package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterDashboardDto {

    private long totalCandidates;
    private long aiScreened;
    private long shortlisted;
    private long interviews;

    private RecruiterPipelineDto pipeline;

    private List<RecentCandidateDto> recentCandidates;

    private List<DashboardInterviewDto> upcomingInterviews;
}