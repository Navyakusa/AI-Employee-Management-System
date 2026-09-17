package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewerInterviewDto {

    private Long interviewId;

    private Long candidateId;
    private String candidateName;
    private String candidateEmail;

    private Long jobId;
    private String jobTitle;

    private LocalDateTime interviewDateTime;

    private String interviewMode;
    private String meetingLink;
    private String location;

    private String status;

    private String notes;
}