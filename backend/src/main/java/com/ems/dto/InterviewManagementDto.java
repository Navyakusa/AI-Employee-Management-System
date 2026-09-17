package com.ems.dto;

import com.ems.common.InterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewManagementDto {

    private Long interviewId;

    private Long applicationId;

    private Long candidateId;

    private String candidateName;

    private String candidateEmail;

    private Long jobId;

    private String position;

    private Long interviewerId;

    private String interviewerName;

    private LocalDateTime interviewDateTime;

    private String interviewType;

    private String interviewMode;

    private String meetingLink;

    private String location;

    private String notes;

    private InterviewStatus status;
}