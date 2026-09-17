package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewManagementDto;
import com.ems.dto.InterviewRequestDto;
import com.ems.dto.InterviewStatsDto;
import com.ems.entity.Application;
import com.ems.entity.Interview;
import com.ems.entity.User;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import com.ems.common.InterviewStatus;

@Service
public class InterviewService {
    @Autowired
    private JobRepository jobRepository;
    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;


    public ResponseEntity<ApiResponse<Interview>> scheduleInterview(
            InterviewRequestDto dto) {

        try {

            Application application = applicationRepository
                    .findById(dto.getApplicationId())
                    .orElseThrow(() ->
                            new RuntimeException("Application not found")
                    );

            Interview interview = new Interview();

            interview.setApplicationId(
                    application.getApplicationId()
            );

            interview.setCandidateId(
                    application.getCandidateId()
            );
            interview.setInterviewType(
                    dto.getInterviewType()
            );
            interview.setJobId(
                    application.getJobId()
            );
            interview.setInterviewerId(
                    dto.getInterviewerId()
            );

            interview.setInterviewDateTime(
                    dto.getInterviewDateTime()
            );

            interview.setInterviewMode(
                    dto.getInterviewMode()
            );

            interview.setMeetingLink(
                    dto.getMeetingLink()
            );

            interview.setLocation(
                    dto.getLocation()
            );

            interview.setNotes(
                    dto.getNotes()
            );

            interview.setStatus(InterviewStatus.SCHEDULED);

            interview.setCreatedAt(
                    LocalDateTime.now()
            );

            // Save interview
            Interview savedInterview =
                    interviewRepository.save(interview);


            // =========================
            // CANDIDATE NOTIFICATION
            // =========================

            notificationService.createNotification(
                    application.getCandidateId(),
                    "Your interview has been scheduled on "
                            + interview.getInterviewDateTime(),
                    "INTERVIEW_SCHEDULED"
            );


            ApiResponse<Interview> response =
                    new ApiResponse<>(
                            true,
                            "Interview scheduled successfully",
                            savedInterview
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.CREATED
            );

        } catch (Exception e) {

            ApiResponse<Interview> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // Candidate views own interviews
    public ResponseEntity<ApiResponse<List<Interview>>> getMyInterviews(
            Authentication authentication) {

        try {

            String email = authentication.getName();

            User candidate = userRepository
                    .findByEmailIgnoreCase(email)
                    .orElseThrow(() ->
                            new RuntimeException("Candidate not found")
                    );

            List<Interview> interviews =
                    interviewRepository.findByCandidateId(
                            candidate.getUserId()
                    );

            ApiResponse<List<Interview>> response =
                    new ApiResponse<>(
                            true,
                            "Interviews fetched successfully",
                            interviews
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Interview>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // Employer views interviews for a particular job
    public ResponseEntity<ApiResponse<List<Interview>>> getInterviewsByJob(
            Long jobId) {

        try {

            List<Interview> interviews =
                    interviewRepository.findByJobId(jobId);

            ApiResponse<List<Interview>> response =
                    new ApiResponse<>(
                            true,
                            "Interviews fetched successfully",
                            interviews
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<List<Interview>> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // Employer reschedules interview
    public ResponseEntity<ApiResponse<Interview>> rescheduleInterview(
            Long interviewId,
            InterviewRequestDto dto) {

        try {

            Interview interview =
                    interviewRepository
                            .findById(interviewId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Interview not found"
                                    )
                            );

            interview.setInterviewDateTime(
                    dto.getInterviewDateTime()
            );
            interview.setInterviewType(
                    dto.getInterviewType()
            );
            interview.setInterviewMode(
                    dto.getInterviewMode()
            );

            interview.setMeetingLink(
                    dto.getMeetingLink()
            );

            interview.setLocation(
                    dto.getLocation()
            );

            interview.setNotes(
                    dto.getNotes()
            );

            interview.setStatus(InterviewStatus.RESCHEDULED);

            Interview updatedInterview =
                    interviewRepository.save(interview);
            notificationService.createNotification(
                    interview.getCandidateId(),
                    "Your interview has been rescheduled to "
                            + interview.getInterviewDateTime(),
                    "INTERVIEW_RESCHEDULED"
            );

            notificationService.createNotification(
                    interview.getInterviewerId(),
                    "Your assigned interview has been rescheduled to "
                            + interview.getInterviewDateTime(),
                    "INTERVIEW_RESCHEDULED"
            );

            ApiResponse<Interview> response =
                    new ApiResponse<>(
                            true,
                            "Interview rescheduled successfully",
                            updatedInterview
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Interview> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }


    // Employer updates interview status
    public ResponseEntity<ApiResponse<Interview>> updateInterviewStatus(
            Long interviewId,
            String status) {

        try {

            Interview interview =
                    interviewRepository
                            .findById(interviewId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Interview not found"
                                    )
                            );

            interview.setStatus(InterviewStatus.valueOf(status.toUpperCase()));

            Interview updatedInterview =
                    interviewRepository.save(interview);
            if ("CANCELLED".equalsIgnoreCase(status)) {

                notificationService.createNotification(
                        interview.getCandidateId(),
                        "Your interview has been cancelled.",
                        "INTERVIEW_CANCELLED"
                );

                notificationService.createNotification(
                        interview.getInterviewerId(),
                        "Your assigned interview has been cancelled.",
                        "INTERVIEW_CANCELLED"
                );
            }

            ApiResponse<Interview> response =
                    new ApiResponse<>(
                            true,
                            "Interview status updated successfully",
                            updatedInterview
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.OK
            );

        } catch (Exception e) {

            ApiResponse<Interview> response =
                    new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    );

            return new ResponseEntity<>(
                    response,
                    HttpStatus.BAD_REQUEST
            );
        }
    }
    private InterviewManagementDto toManagementDto(
            Interview interview
    ) {

        InterviewManagementDto dto =
                new InterviewManagementDto();

        dto.setInterviewId(
                interview.getInterviewId()
        );

        dto.setApplicationId(
                interview.getApplicationId()
        );

        dto.setCandidateId(
                interview.getCandidateId()
        );

        dto.setJobId(
                interview.getJobId()
        );

        dto.setInterviewerId(
                interview.getInterviewerId()
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

        dto.setLocation(
                interview.getLocation()
        );

        dto.setNotes(
                interview.getNotes()
        );

        dto.setStatus(
                interview.getStatus()
        );


        // Candidate
        if (interview.getCandidateId() != null) {

            userRepository
                    .findById(interview.getCandidateId())
                    .ifPresent(user -> {

                        dto.setCandidateName(
                                user.getUserName()
                        );

                        dto.setCandidateEmail(
                                user.getEmail()
                        );
                    });
        }


        // Job
        if (interview.getJobId() != null) {

            jobRepository
                    .findById(interview.getJobId())
                    .ifPresent(job ->
                            dto.setPosition(
                                    job.getTitle()
                            )
                    );
        }


        // Interviewer
        if (interview.getInterviewerId() != null) {

            userRepository
                    .findById(interview.getInterviewerId())
                    .ifPresent(user ->
                            dto.setInterviewerName(
                                    user.getUserName()
                            )
                    );
        }

        return dto;
    }
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    getInterviewManagementData() {

        try {

            List<InterviewManagementDto> result =
                    interviewRepository
                            .findAll()
                            .stream()
                            .map(this::toManagementDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview management data retrieved successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve interviews",
                                    null
                            )
                    );
        }
    }
    public ResponseEntity<ApiResponse<InterviewStatsDto>>
    getInterviewStats() {

        try {

            long total =
                    interviewRepository.count();

            long scheduled =
                    interviewRepository.countByStatus(
                            InterviewStatus.SCHEDULED
                    );

            long completed =
                    interviewRepository.countByStatus(
                            InterviewStatus.COMPLETED
                    );

            long cancelled =
                    interviewRepository.countByStatus(
                            InterviewStatus.CANCELLED
                    );

            InterviewStatsDto stats =
                    new InterviewStatsDto(
                            total,
                            scheduled,
                            completed,
                            cancelled
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview statistics retrieved successfully",
                            stats
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve interview statistics",
                                    null
                            )
                    );
        }
    }
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    getUpcomingInterviews() {

        try {

            List<InterviewManagementDto> result =
                    interviewRepository
                            .findByInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(
                                    LocalDateTime.now()
                            )
                            .stream()
                            .filter(interview ->
                                    interview.getStatus()
                                            == InterviewStatus.SCHEDULED
                                            ||
                                            interview.getStatus()
                                                    == InterviewStatus.RESCHEDULED
                            )
                            .map(this::toManagementDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Upcoming interviews retrieved successfully",
                            result
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve upcoming interviews",
                                    null
                            )
                    );
        }
    }
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    searchInterviews(String keyword) {

        try {

            String search = keyword == null
                    ? ""
                    : keyword.trim().toLowerCase();

            List<InterviewManagementDto> result =
                    interviewRepository.findAll()
                            .stream()
                            .map(this::toManagementDto)
                            .filter(dto ->
                                    containsIgnoreCase(dto.getCandidateName(), search)
                                            || containsIgnoreCase(dto.getCandidateEmail(), search)
                                            || containsIgnoreCase(dto.getPosition(), search)
                                            || containsIgnoreCase(dto.getInterviewerName(), search)
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview search completed successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to search interviews",
                            null
                    ));
        }
    }

    private boolean containsIgnoreCase(
            String value,
            String search
    ) {
        return value != null &&
                value.toLowerCase().contains(search);
    }
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    getInterviewsByStatus(String status) {

        try {

            InterviewStatus interviewStatus;

            try {
                interviewStatus =
                        InterviewStatus.valueOf(
                                status.trim().toUpperCase()
                        );
            } catch (IllegalArgumentException e) {

                return ResponseEntity
                        .badRequest()
                        .body(new ApiResponse<>(
                                false,
                                "Invalid interview status: " + status,
                                null
                        ));
            }

            List<InterviewManagementDto> result =
                    interviewRepository
                            .findByStatus(interviewStatus)
                            .stream()
                            .map(this::toManagementDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interviews filtered successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to filter interviews",
                            null
                    ));
        }
    }
    public ResponseEntity<ApiResponse<InterviewManagementDto>>
    getInterviewDetails(Long interviewId) {

        try {

            Interview interview =
                    interviewRepository
                            .findById(interviewId)
                            .orElse(null);

            if (interview == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Interview not found",
                                null
                        ));
            }

            InterviewManagementDto dto =
                    toManagementDto(interview);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview details retrieved successfully",
                            dto
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve interview details",
                            null
                    ));
        }
    }
}