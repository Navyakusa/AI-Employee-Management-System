
package com.ems.dto;

import com.ems.entity.Interview;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewerDashboardDto {

    private Long interviewerId;

    private Long todaysInterviews;

    private Long upcomingInterviews;

    private Long completedInterviews;

    private Long pendingEvaluations;

    private List<Interview> todaysSchedule;

    private List<Interview> evaluationQueue;
}