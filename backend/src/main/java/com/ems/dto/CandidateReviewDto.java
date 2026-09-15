package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateReviewDto {

    // Application
    private Long applicationId;
    private String status;
    private LocalDateTime appliedAt;

    // Candidate/User
    private Long candidateId;
    private String candidateName;
    private String email;

    // Candidate Profile
    private String phone;
    private String location;
    private String education;
    private String experience;
    private String skills;
    private String linkedin;
    private String portfolio;
    private Double expectedSalary;
    private String noticePeriod;
    private String source;

    // Job
    private Long jobId;
    private String jobTitle;
    private String department;
    private String employmentType;
    private String jobLocation;
    private String requiredSkills;
    private String preferredSkills;

    // Resume
    private Long resumeId;
    private String resumeFileName;
    private String resumeFileType;
    private String extractedSkills;
    private String extractedExperience;
    private String extractedEducation;

    // AI Matching
    private Double aiMatchScore;
    private Double skillMatch;
    private Double experienceMatch;
    private Double educationMatch;
    private Double certificationMatch;
    private Double locationMatch;
    private Double roleMatch;
    private String aiExplanation;
}