package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardInterviewDto {

    private Long interviewId;
    private String candidateName;
    private String position;
    private LocalDateTime interviewDateTime;
    private String interviewType;
    private String interviewMode;
    private String meetingLink;
}