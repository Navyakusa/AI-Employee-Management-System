package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class InterviewRequestDto {

    private Long applicationId;

    private Long interviewerId;

    private LocalDateTime interviewDateTime;

    private String interviewMode;

    private String meetingLink;

    private String location;

    private String notes;

    private String interviewType;
}