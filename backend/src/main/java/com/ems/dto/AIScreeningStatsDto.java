package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIScreeningStatsDto {

    private long totalScreened;
    private long highMatch;
    private long recommended;
    private long needsReview;
}