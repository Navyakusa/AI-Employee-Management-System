package com.ems.entity;

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
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String department;
    private String location;
    private String employmentType;

    private Integer experienceMin;
    private Integer experienceMax;

    private Double salaryMin;
    private Double salaryMax;

    private String requiredSkills;
    private String preferredSkills;

    private String education;
    private String description;
    private String responsibilities;

    private Integer openings;
    private String status;

    private LocalDateTime createdDate;
    private LocalDateTime closingDate;
    private Long hiringManagerId;
}