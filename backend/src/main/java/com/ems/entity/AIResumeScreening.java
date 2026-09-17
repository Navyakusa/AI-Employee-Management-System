package com.ems.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
public class AIResumeScreening {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long candidateId;

    private Long jobId;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(columnDefinition = "TEXT")
    private String jobTitles;

    @Column(columnDefinition = "TEXT")
    private String companies;

    @Column(columnDefinition = "TEXT")
    private String technologies;

    @Column(columnDefinition = "TEXT")
    private String projects;

    private Double yearsOfExperience;

    private Double screeningScore;

    @Column(columnDefinition = "TEXT")
    private String screeningResult;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    private LocalDateTime screenedAt;
}