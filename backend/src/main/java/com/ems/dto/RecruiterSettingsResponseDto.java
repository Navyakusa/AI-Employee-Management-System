package com.ems.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterSettingsResponseDto {

    private Long userId;

    private String recruiterName;

    private String email;

    private String designation;

    private Boolean emailNotifications;

    private Boolean interviewNotifications;

    private Boolean candidateUpdates;

    private String theme;
}