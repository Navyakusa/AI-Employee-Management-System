package com.ems.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningQuestionRequestDto {

    @NotBlank(message = "Question is required")
    private String question;

    private String category;

    private Long jobId;

    private String difficulty;

    private Boolean active;
}