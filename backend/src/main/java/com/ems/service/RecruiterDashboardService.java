package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.common.InterviewStatus;
import com.ems.dto.*;
import com.ems.entity.*;
import com.ems.repository.*;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruiterDashboardService {

    private final CandidateRepository candidateRepository;

    private final ApplicationRepository applicationRepository;

    private final AIResumeScreeningRepository screeningRepository;

    private final InterviewRepository interviewRepository;

    private final UserRepository userRepository;

    private final JobRepository jobRepository;


    public ResponseEntity<ApiResponse<RecruiterDashboardDto>>
    getDashboard() {

        try {

            // =========================================
            // TOP CARDS
            // =========================================

            long totalCandidates =
                    candidateRepository.count();

            long aiScreened =
                    screeningRepository.count();

            long shortlisted =
                    applicationRepository.countByStatus(
                            ApplicationStatus.SHORTLISTED
                    );

            long interviews =
                    interviewRepository.count();


            // =========================================
            // PIPELINE
            // =========================================

            long applied =
                    applicationRepository.countByStatus(
                            ApplicationStatus.APPLIED
                    );

            long hrScreening =
                    applicationRepository.countByStatus(
                            ApplicationStatus.SCREENING
                    );

            long interview =
                    applicationRepository.countByStatus(
                            ApplicationStatus.INTERVIEW
                    );

            long selected =
                    applicationRepository.countByStatus(
                            ApplicationStatus.SELECTED
                    );


            RecruiterPipelineDto pipeline =
                    new RecruiterPipelineDto(
                            applied,
                            aiScreened,
                            shortlisted,
                            hrScreening,
                            interview,
                            selected
                    );


            // =========================================
            // RECENT CANDIDATES
            // =========================================

            List<RecentCandidateDto> recentCandidates =
                    buildRecentCandidates();


            // =========================================
            // UPCOMING INTERVIEWS
            // =========================================

            List<DashboardInterviewDto> upcomingInterviews =
                    buildUpcomingInterviews();


            RecruiterDashboardDto dashboard =
                    new RecruiterDashboardDto(
                            totalCandidates,
                            aiScreened,
                            shortlisted,
                            interviews,
                            pipeline,
                            recentCandidates,
                            upcomingInterviews
                    );


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Recruiter dashboard retrieved successfully",
                            dashboard
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve recruiter dashboard: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =====================================================
    // RECENT CANDIDATES
    // =====================================================

    private List<RecentCandidateDto> buildRecentCandidates() {

        List<Application> applications =
                applicationRepository
                        .findTop5ByOrderByAppliedAtDesc();

        List<RecentCandidateDto> result =
                new ArrayList<>();


        for (Application application : applications) {

            /*
             * Your Application.candidateId points
             * to User.userId.
             */
            User user =
                    userRepository
                            .findById(
                                    application.getCandidateId()
                            )
                            .orElse(null);

            if (user == null) {
                continue;
            }


            Job job =
                    jobRepository
                            .findById(
                                    application.getJobId()
                            )
                            .orElse(null);

            if (job == null) {
                continue;
            }


            /*
             * Resume / AI screening uses Candidate.id.
             *
             * Therefore resolve Candidate through email.
             */
            Candidate candidate =
                    candidateRepository
                            .findByEmailIgnoreCase(
                                    user.getEmail()
                            )
                            .orElse(null);


            Double aiMatch = null;

            Long candidateId = null;


            if (candidate != null) {

                candidateId =
                        candidate.getId();

                AIResumeScreening screening =
                        screeningRepository
                                .findFirstByCandidateIdAndJobIdOrderByIdDesc(
                                        candidate.getId(),
                                        job.getId()
                                )
                                .orElse(null);

                if (screening != null) {

                    aiMatch =
                            screening.getScreeningScore();
                }
            }


            RecentCandidateDto dto =
                    new RecentCandidateDto();

            dto.setCandidateId(candidateId);

            dto.setCandidateName(
                    user.getUserName()
            );

            dto.setCandidateEmail(
                    user.getEmail()
            );

            dto.setJobId(
                    job.getId()
            );

            dto.setPosition(
                    job.getTitle()
            );

            dto.setAiMatch(
                    aiMatch
            );

            dto.setStatus(
                    application.getStatus() == null
                            ? null
                            : application.getStatus().name()
            );


            result.add(dto);
        }


        return result;
    }


    // =====================================================
    // UPCOMING INTERVIEWS
    // =====================================================

    private List<DashboardInterviewDto>
    buildUpcomingInterviews() {

        List<Interview> interviews =
                interviewRepository
                        .findByInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(
                                LocalDateTime.now()
                        );


        return interviews.stream()

                .filter(interview ->

                        interview.getStatus()
                                == InterviewStatus.SCHEDULED

                                ||

                                interview.getStatus()
                                        == InterviewStatus.RESCHEDULED
                )

                // Dashboard only needs a few
                .limit(5)

                .map(interview -> {

                    DashboardInterviewDto dto =
                            new DashboardInterviewDto();


                    dto.setInterviewId(
                            interview.getInterviewId()
                    );


                    // Candidate ID here is User.userId
                    userRepository
                            .findById(
                                    interview.getCandidateId()
                            )
                            .ifPresent(user ->
                                    dto.setCandidateName(
                                            user.getUserName()
                                    )
                            );


                    jobRepository
                            .findById(
                                    interview.getJobId()
                            )
                            .ifPresent(job ->
                                    dto.setPosition(
                                            job.getTitle()
                                    )
                            );


                    dto.setInterviewDateTime(
                            interview.getInterviewDateTime()
                    );

                    dto.setInterviewType(
                            interview.getInterviewType()
                    );

                    dto.setInterviewMode(
                            interview.getInterviewMode()
                    );

                    dto.setMeetingLink(
                            interview.getMeetingLink()
                    );


                    return dto;

                })
                .toList();
    }
}