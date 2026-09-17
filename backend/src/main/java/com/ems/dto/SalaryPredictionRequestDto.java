package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SalaryPredictionRequestDto {

    @JsonProperty("Job_Title")
    private String jobTitle;

    @JsonProperty("Company_Type")
    private String companyType;

    @JsonProperty("Industry")
    private String industry;

    @JsonProperty("City")
    private String city;

    @JsonProperty("Location_Tier")
    private String locationTier;

    @JsonProperty("Experience_Level")
    private String experienceLevel;

    @JsonProperty("Job_Type")
    private String jobType;

    @JsonProperty("Work_Mode")
    private String workMode;

    @JsonProperty("Education_Required")
    private String educationRequired;

    @JsonProperty("Skills_Required")
    private String skillsRequired;

    @JsonProperty("Openings")
    private Integer openings;

    @JsonProperty("Applicants")
    private Integer applicants;

    @JsonProperty("Company_Rating")
    private Double companyRating;
}