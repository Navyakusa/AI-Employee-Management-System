package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonScreeningJobDto {

    private String job_id;
    private String job_title;
    private String seniority;
    private String industry;
    private String must_have_skills;
    private String nice_to_have_skills;
    private String description;
    private String responsibilities;
    private String requirements;
}