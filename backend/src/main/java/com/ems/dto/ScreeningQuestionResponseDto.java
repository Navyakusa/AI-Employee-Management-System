package com.ems.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningQuestionResponseDto {

    private Long id;

    private String question;

    private String category;

    private Long jobId;

    private String position;

    private String difficulty;

    private Boolean active;

    private String source;

    private LocalDateTime createdAt;
}