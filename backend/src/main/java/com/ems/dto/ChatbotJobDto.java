
package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ChatbotJobDto {

    private Long jobId;

    private String title;
    private String department;
    private String location;
    private String employmentType;

    private Integer experienceMin;
    private Integer experienceMax;

    private String requiredSkills;
    private String preferredSkills;
    private String education;

    private String description;
    private String responsibilities;

    private Double salaryMin;
    private Double salaryMax;

    private Integer openings;

    private LocalDateTime closingDate;
}
