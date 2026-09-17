package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewStatsDto {

    private long totalInterviews;

    private long scheduled;

    private long completed;

    private long cancelled;
}