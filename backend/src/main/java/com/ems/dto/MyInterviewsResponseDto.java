package com.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyInterviewsResponseDto {

    private Long scheduledCount;

    private Long completedCount;

    private Long totalCount;

    private List<InterviewerInterviewDto> interviews;
}