package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIScreeningManagementDto {

    private Long screeningId;

    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    private Long jobId;
    private String position;

    private Double yearsOfExperience;
    private String skills;

    private Double aiMatch;
    private String result;
    private String recommendation;

    private LocalDateTime screenedAt;
}