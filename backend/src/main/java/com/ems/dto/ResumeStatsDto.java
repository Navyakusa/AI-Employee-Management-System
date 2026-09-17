package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResumeStatsDto {

    private long totalResumes;
    private long shortlisted;
    private long underScreening;
    private long highMatch;
}