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
public class CandidateDashboardApplicationDto {

    private Long applicationId;

    private Long jobId;

    private String jobTitle;

    private String department;

    private String location;

    private String status;

    private LocalDateTime appliedAt;
}