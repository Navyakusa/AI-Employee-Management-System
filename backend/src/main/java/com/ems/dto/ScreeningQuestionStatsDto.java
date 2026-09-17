package com.ems.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningQuestionStatsDto {

    private long totalQuestions;

    private long active;

    private long technical;

    private long behavioral;
}