package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PythonScreeningResponseDto {

    private String job_id;

    private String resume_id;

    private Map<String, Object> extracted_resume_profile;

    private Map<String, Object> extracted_job_requirements;

    private List<Map<String, Object>> screening_dimensions;
}