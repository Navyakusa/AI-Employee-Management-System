package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.InterviewStatus;
import com.ems.dto.InterviewerDashboardDto;
import com.ems.entity.User;
import com.ems.repository.InterviewerDashboardRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class InterviewerDashboardService {

    private final InterviewerDashboardRepository interviewRepository;
    private final UserRepository userRepository;

    public InterviewerDashboardService(
            InterviewerDashboardRepository interviewRepository,
            UserRepository userRepository) {

        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<InterviewerDashboardDto>>
    getDashboard(Authentication authentication) {

        String email = authentication.getName();

        User interviewer = userRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        if (interviewer == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Interviewer not found",
                            null
                    ));
        }

        Long interviewerId = interviewer.getUserId();

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay =
                today.atStartOfDay();

        LocalDateTime endOfDay =
                today.atTime(LocalTime.MAX);

        LocalDateTime now =
                LocalDateTime.now();

        long todaysInterviews =
                interviewRepository
                        .countByInterviewerIdAndInterviewDateTimeBetween(
                                interviewerId,
                                startOfDay,
                                endOfDay
                        );

        long upcomingInterviews =
                interviewRepository
                        .countByInterviewerIdAndInterviewDateTimeAfter(
                                interviewerId,
                                now
                        );

        long completedInterviews =
                interviewRepository
                        .countByInterviewerIdAndStatus(
                                interviewerId,
                                InterviewStatus.COMPLETED
                        );

        long pendingEvaluations =
                interviewRepository
                        .countByInterviewerIdAndStatus(
                                interviewerId,
                                InterviewStatus.COMPLETED
                        );

        List<com.ems.entity.Interview> todaysSchedule =
                interviewRepository
                        .findByInterviewerIdAndInterviewDateTimeBetweenOrderByInterviewDateTimeAsc(
                                interviewerId,
                                startOfDay,
                                endOfDay
                        );

        List<com.ems.entity.Interview> evaluationQueue =
                interviewRepository
                        .findByInterviewerIdAndStatusOrderByInterviewDateTimeAsc(
                                interviewerId,
                                InterviewStatus.COMPLETED
                        );

        InterviewerDashboardDto dashboard =
                new InterviewerDashboardDto();

        dashboard.setInterviewerId(interviewerId);
        dashboard.setTodaysInterviews(todaysInterviews);
        dashboard.setUpcomingInterviews(upcomingInterviews);
        dashboard.setCompletedInterviews(completedInterviews);
        dashboard.setPendingEvaluations(pendingEvaluations);
        dashboard.setTodaysSchedule(todaysSchedule);
        dashboard.setEvaluationQueue(evaluationQueue);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Interviewer dashboard retrieved successfully",
                        dashboard
                )
        );
    }
}