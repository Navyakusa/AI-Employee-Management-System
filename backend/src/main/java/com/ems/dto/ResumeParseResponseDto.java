
package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ResumeParseResponseDto {

    private List<String> name;

    @JsonProperty("skills_raw")
    private List<String> skillsRaw;

    @JsonProperty("skills_cleaned")
    private List<String> skillsCleaned;

    @JsonProperty("companies_worked_at")
    private List<String> companiesWorkedAt;

    private List<String> designation;

    private List<String> degree;

    @JsonProperty("college_name")
    private List<String> collegeName;

    @JsonProperty("graduation_year")
    private List<String> graduationYear;

    @JsonProperty("years_of_experience")
    private List<String> yearsOfExperience;

    @JsonProperty("email_address")
    private List<String> emailAddress;

    private List<String> location;
}