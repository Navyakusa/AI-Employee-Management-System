package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HiringManagerDashboardDto {

    private Long totalJobs;

    private Long openJobs;

    private Long totalApplications;

    private Long totalInterviews;

    private String department;
}