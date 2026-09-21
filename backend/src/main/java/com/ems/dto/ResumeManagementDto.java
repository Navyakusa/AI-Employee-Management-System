package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeManagementDto {

    private Long resumeId;
    private Long candidateId;

    private String candidateName;
    private String candidateEmail;

    private Long applicationId;
    private Long jobId;
    private String position;

    private String experience;
    private String skills;

    private LocalDateTime uploadedAt;

    private Double aiMatch;
    private String status;

    // Tells frontend whether the actual resume file exists on the server
    private Boolean fileAvailable;
}