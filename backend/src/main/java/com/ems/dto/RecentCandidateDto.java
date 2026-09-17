package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentCandidateDto {

    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    private Long jobId;
    private String position;

    private Double aiMatch;

    private String status;
}