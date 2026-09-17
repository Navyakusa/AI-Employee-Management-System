package com.ems.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterSettingsUpdateDto {

    private String recruiterName;

    private String email;

    private String designation;

    private Boolean emailNotifications;

    private Boolean interviewNotifications;

    private Boolean candidateUpdates;

    private String theme;
}