package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.InterviewStatus;
import com.ems.dto.AvailableInterviewerDto;
import com.ems.dto.InterviewManagementDto;
import com.ems.dto.InterviewRequestDto;
import com.ems.dto.InterviewStatsDto;
import com.ems.dto.InterviewerCandidateDto;
import com.ems.dto.EligibleInterviewCandidateDto;
import com.ems.entity.AIResumeScreening;
import com.ems.repository.AIResumeScreeningRepository;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.ems.entity.Application;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AIResumeScreeningRepository aiResumeScreeningRepository;


    // =========================================================
    // SCHEDULE INTERVIEW
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<Interview>> scheduleInterview(
            InterviewRequestDto dto) {

        try {

            if (dto.getApplicationId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application ID is required",
                                        null
                                )
                        );
            }

            if (dto.getInterviewerId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Interviewer ID is required",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 1. Find application
            // -------------------------------------------------

            Application application =
                    applicationRepository
                            .findById(dto.getApplicationId())
                            .orElse(null);

            if (application == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 2. Validate application eligibility consistently with
            //    getEligibleInterviewCandidates().
            //    SHORTLISTED applications remain eligible. AI_SCREENED
            //    applications are eligible only when their latest screening
            //    result is positive.
            // -------------------------------------------------

            com.ems.common.ApplicationStatus applicationStatus =
                    application.getStatus();

            boolean isShortlisted = applicationStatus ==
                    com.ems.common.ApplicationStatus.SHORTLISTED;

            boolean isAiScreened = applicationStatus ==
                    com.ems.common.ApplicationStatus.AI_SCREENED;

            if (!isShortlisted && !isAiScreened) {
                return ResponseEntity
                        .badRequest()
                        .body(new ApiResponse<>(
                                false,
                                "Only shortlisted or AI-qualified applications can be scheduled for interview",
                                null
                        ));
            }

            if (isAiScreened) {
                AIResumeScreening latestScreening =
                        aiResumeScreeningRepository
                                .findAllByOrderByScreenedAtDesc()
                                .stream()
                                .filter(screening -> screening.getCandidateId() != null
                                        && screening.getJobId() != null
                                        && screening.getCandidateId().equals(application.getCandidateId())
                                        && screening.getJobId().equals(application.getJobId()))
                                .findFirst()
                                .orElse(null);

                if (latestScreening == null || !isScreeningEligible(latestScreening)) {
                    return ResponseEntity
                            .badRequest()
                            .body(new ApiResponse<>(
                                    false,
                                    "AI-screened applications require a qualifying latest AI screening result before interview scheduling",
                                    null
                            ));
                }
            }

            // -------------------------------------------------
            // 3. Find candidate
            // -------------------------------------------------

            Candidate candidate =
                    candidateRepository
                            .findById(
                                    application.getCandidateId()
                            )
                            .orElse(null);

            if (candidate == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate not found for application",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 4. Find job
            // -------------------------------------------------

            Job job =
                    jobRepository
                            .findById(
                                    application.getJobId()
                            )
                            .orElse(null);

            if (job == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Job not found for application",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 5. Find interviewer
            // -------------------------------------------------

            User interviewer =
                    userRepository
                            .findById(
                                    dto.getInterviewerId()
                            )
                            .orElse(null);

            if (interviewer == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Interviewer not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 6. Verify interviewer role
            // -------------------------------------------------

            if (interviewer.getRole() == null ||
                    !interviewer.getRole()
                            .equalsIgnoreCase("INTERVIEWER")) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Selected user is not an interviewer",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 7. Create interview
            // -------------------------------------------------

            Interview interview =
                    new Interview();

            interview.setApplicationId(
                    application.getApplicationId()
            );

            interview.setCandidateId(
                    candidate.getId()
            );

            interview.setInterviewType(
                    dto.getInterviewType()
            );

            interview.setJobId(
                    job.getId()
            );

            interview.setInterviewerId(
                    interviewer.getUserId()
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

            interview.setStatus(
                    InterviewStatus.SCHEDULED
            );

            interview.setCreatedAt(
                    LocalDateTime.now()
            );

            Interview savedInterview =
                    interviewRepository.save(
                            interview
                    );

            // Update and persist the application status after scheduling the interview.
            application.setStatus(
                    com.ems.common.ApplicationStatus.INTERVIEW
            );
            applicationRepository.saveAndFlush(application);

            // -------------------------------------------------
            // 8. Candidate notification
            // -------------------------------------------------

            User candidateUser =
                    userRepository
                            .findByEmailIgnoreCase(
                                    candidate.getEmail()
                            )
                            .orElse(null);

            if (candidateUser != null) {

                notificationService.createNotification(
                        candidateUser.getUserId(),
                        "Your interview for "
                                + job.getTitle()
                                + " has been scheduled on "
                                + interview.getInterviewDateTime(),
                        "INTERVIEW_SCHEDULED"
                );
            }

            // -------------------------------------------------
            // 9. Interviewer notification
            // -------------------------------------------------

            notificationService.createNotification(
                    interviewer.getUserId(),
                    "You have been assigned an interview for "
                            + candidate.getName()
                            + " on "
                            + interview.getInterviewDateTime(),
                    "INTERVIEW_SCHEDULED"
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Interview scheduled successfully",
                                    savedInterview
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to schedule interview: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // AVAILABLE INTERVIEWERS
    // =========================================================

    public ResponseEntity<ApiResponse<List<AvailableInterviewerDto>>>
    getAvailableInterviewers() {

        try {

            List<User> users =
                    userRepository.findByRole("INTERVIEWER");

            List<AvailableInterviewerDto> interviewers =
                    users.stream()
                            .map(user ->
                                    new AvailableInterviewerDto(
                                            user.getUserId(),
                                            user.getUserName(),
                                            user.getRole()
                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Available interviewers fetched successfully",
                            interviewers
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch available interviewers: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // CANDIDATE - MY INTERVIEWS
    // =========================================================

    public ResponseEntity<ApiResponse<List<Interview>>>
    getMyInterviews(
            Authentication authentication) {

        try {

            String email =
                    authentication.getName();

            Candidate candidate =
                    candidateRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

            if (candidate == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate profile not found",
                                        null
                                )
                        );
            }

            List<Interview> interviews =
                    interviewRepository.findByCandidateId(
                            candidate.getId()
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interviews fetched successfully",
                            interviews
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // INTERVIEWER - MY CANDIDATES
    // =========================================================

    public ResponseEntity<ApiResponse<List<InterviewerCandidateDto>>>
    getMyCandidates(
            Authentication authentication) {

        try {

            if (authentication == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Authentication is required",
                                        null
                                )
                        );
            }

            String email =
                    authentication.getName();

            // -------------------------------------------------
            // 1. Find logged-in interviewer
            // -------------------------------------------------

            User interviewer =
                    userRepository
                            .findByEmailIgnoreCase(email)
                            .orElse(null);

            if (interviewer == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Interviewer account not found",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 2. Verify interviewer role
            // -------------------------------------------------

            if (interviewer.getRole() == null ||
                    !interviewer.getRole()
                            .equalsIgnoreCase("INTERVIEWER")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only interviewers can access assigned candidates",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // 3. Find interviews assigned to interviewer
            // -------------------------------------------------

            List<Interview> interviews =
                    interviewRepository.findByInterviewerId(
                            interviewer.getUserId()
                    );

            // -------------------------------------------------
            // 4. Convert to interviewer candidate DTO
            // -------------------------------------------------

            List<InterviewerCandidateDto> result =
                    interviews.stream()
                            .map(this::toInterviewerCandidateDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interviewer candidates fetched successfully",
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
                                    "Failed to fetch interviewer candidates: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // CONVERT INTERVIEW TO INTERVIEWER CANDIDATE DTO
    // =========================================================

    private InterviewerCandidateDto toInterviewerCandidateDto(
            Interview interview) {

        InterviewerCandidateDto dto =
                new InterviewerCandidateDto();

        // -------------------------------------------------
        // Interview information
        // -------------------------------------------------

        dto.setInterviewId(
                interview.getInterviewId()
        );

        dto.setInterviewDateTime(
                interview.getInterviewDateTime()
        );

        dto.setInterviewMode(
                interview.getInterviewMode()
        );

        dto.setInterviewStatus(
                interview.getStatus() != null
                        ? interview.getStatus().name()
                        : null
        );

        // -------------------------------------------------
        // Candidate information
        // -------------------------------------------------

        if (interview.getCandidateId() != null) {

            Candidate candidate =
                    candidateRepository
                            .findById(
                                    interview.getCandidateId()
                            )
                            .orElse(null);

            if (candidate != null) {

                dto.setCandidateId(
                        candidate.getId()
                );

                dto.setCandidateName(
                        candidate.getName()
                );

                dto.setEmail(
                        candidate.getEmail()
                );

                dto.setPhone(
                        candidate.getPhone()
                );

                dto.setLocation(
                        candidate.getLocation()
                );

                dto.setEducation(
                        candidate.getEducation()
                );

                dto.setExperience(
                        candidate.getExperience()
                );

                dto.setSkills(
                        candidate.getSkills()
                );

                dto.setResume(
                        candidate.getResume()
                );

                dto.setLinkedin(
                        candidate.getLinkedin()
                );

                dto.setPortfolio(
                        candidate.getPortfolio()
                );

                dto.setExpectedSalary(
                        candidate.getExpectedSalary()
                );

                dto.setNoticePeriod(
                        candidate.getNoticePeriod()
                );

                dto.setSource(
                        candidate.getSource()
                );

                dto.setApplicationDate(
                        candidate.getApplicationDate()
                );

                dto.setCandidateStatus(
                        candidate.getStatus()
                );
            }
        }

        // -------------------------------------------------
        // Job information
        // -------------------------------------------------

        if (interview.getJobId() != null) {

            Job job =
                    jobRepository
                            .findById(
                                    interview.getJobId()
                            )
                            .orElse(null);

            if (job != null) {

                dto.setJobId(
                        job.getId()
                );

                dto.setJobTitle(
                        job.getTitle()
                );
            }
        }

        return dto;
    }


    // =========================================================
    // EMPLOYER - INTERVIEWS BY JOB
    // =========================================================

    public ResponseEntity<ApiResponse<List<Interview>>>
    getInterviewsByJob(
            Long jobId) {

        try {

            List<Interview> interviews =
                    interviewRepository.findByJobId(jobId);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interviews fetched successfully",
                            interviews
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // RESCHEDULE INTERVIEW
    // =========================================================

    public ResponseEntity<ApiResponse<Interview>>
    rescheduleInterview(
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

            interview.setStatus(
                    InterviewStatus.RESCHEDULED
            );

            Interview updatedInterview =
                    interviewRepository.save(
                            interview
                    );

            // -------------------------------------------------
            // Candidate notification
            // -------------------------------------------------

            Candidate candidate =
                    candidateRepository
                            .findById(
                                    interview.getCandidateId()
                            )
                            .orElse(null);

            if (candidate != null) {

                User candidateUser =
                        userRepository
                                .findByEmailIgnoreCase(
                                        candidate.getEmail()
                                )
                                .orElse(null);

                if (candidateUser != null) {

                    notificationService.createNotification(
                            candidateUser.getUserId(),
                            "Your interview has been rescheduled to "
                                    + interview.getInterviewDateTime(),
                            "INTERVIEW_RESCHEDULED"
                    );
                }
            }

            // -------------------------------------------------
            // Interviewer notification
            // -------------------------------------------------

            if (interview.getInterviewerId() != null) {

                notificationService.createNotification(
                        interview.getInterviewerId(),
                        "Your assigned interview has been rescheduled to "
                                + interview.getInterviewDateTime(),
                        "INTERVIEW_RESCHEDULED"
                );
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview rescheduled successfully",
                            updatedInterview
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // UPDATE INTERVIEW STATUS
    // =========================================================

    public ResponseEntity<ApiResponse<Interview>>
    updateInterviewStatus(
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

            interview.setStatus(
                    InterviewStatus.valueOf(
                            status.toUpperCase()
                    )
            );

            Interview updatedInterview =
                    interviewRepository.save(
                            interview
                    );

            if ("CANCELLED".equalsIgnoreCase(status)) {

                // Candidate notification
                Candidate candidate =
                        candidateRepository
                                .findById(
                                        interview.getCandidateId()
                                )
                                .orElse(null);

                if (candidate != null) {

                    User candidateUser =
                            userRepository
                                    .findByEmailIgnoreCase(
                                            candidate.getEmail()
                                    )
                                    .orElse(null);

                    if (candidateUser != null) {

                        notificationService.createNotification(
                                candidateUser.getUserId(),
                                "Your interview has been cancelled.",
                                "INTERVIEW_CANCELLED"
                        );
                    }
                }

                // Interviewer notification
                if (interview.getInterviewerId() != null) {

                    notificationService.createNotification(
                            interview.getInterviewerId(),
                            "Your assigned interview has been cancelled.",
                            "INTERVIEW_CANCELLED"
                    );
                }
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview status updated successfully",
                            updatedInterview
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // INTERVIEW MANAGEMENT DTO
    // =========================================================

    private InterviewManagementDto toManagementDto(
            Interview interview) {

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

        // -------------------------------------------------
        // Candidate
        // -------------------------------------------------

        if (interview.getCandidateId() != null) {

            Candidate candidate =
                    candidateRepository
                            .findById(
                                    interview.getCandidateId()
                            )
                            .orElse(null);

            if (candidate != null) {

                dto.setCandidateName(
                        candidate.getName()
                );

                dto.setCandidateEmail(
                        candidate.getEmail()
                );
            }
        }

        // -------------------------------------------------
        // Job
        // -------------------------------------------------

        if (interview.getJobId() != null) {

            jobRepository
                    .findById(
                            interview.getJobId()
                    )
                    .ifPresent(
                            job ->
                                    dto.setPosition(
                                            job.getTitle()
                                    )
                    );
        }

        // -------------------------------------------------
        // Interviewer
        // -------------------------------------------------

        if (interview.getInterviewerId() != null) {

            userRepository
                    .findById(
                            interview.getInterviewerId()
                    )
                    .ifPresent(
                            user ->
                                    dto.setInterviewerName(
                                            user.getUserName()
                                    )
                    );
        }

        return dto;
    }


    // =========================================================
    // INTERVIEW MANAGEMENT
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<InterviewManagementDto>>>
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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve interviews",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve interview statistics",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // UPCOMING INTERVIEWS
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<InterviewManagementDto>>>
    getUpcomingInterviews() {

        try {

            List<InterviewManagementDto> result =
                    interviewRepository
                            .findByInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(
                                    LocalDateTime.now()
                            )
                            .stream()
                            .filter(
                                    interview ->
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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve upcoming interviews",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // SEARCH INTERVIEWS
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<InterviewManagementDto>>>
    searchInterviews(
            String keyword) {

        try {

            String search =
                    keyword == null
                            ? ""
                            : keyword.trim().toLowerCase();

            List<InterviewManagementDto> result =
                    interviewRepository
                            .findAll()
                            .stream()
                            .map(this::toManagementDto)
                            .filter(
                                    dto ->
                                            containsIgnoreCase(
                                                    dto.getCandidateName(),
                                                    search
                                            )
                                                    ||
                                                    containsIgnoreCase(
                                                            dto.getCandidateEmail(),
                                                            search
                                                    )
                                                    ||
                                                    containsIgnoreCase(
                                                            dto.getPosition(),
                                                            search
                                                    )
                                                    ||
                                                    containsIgnoreCase(
                                                            dto.getInterviewerName(),
                                                            search
                                                    )
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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to search interviews",
                                    null
                            )
                    );
        }
    }


    private boolean containsIgnoreCase(
            String value,
            String search) {

        return value != null &&
                value.toLowerCase()
                        .contains(search);
    }


    // =========================================================
    // INTERVIEWS BY STATUS
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<InterviewManagementDto>>>
    getInterviewsByStatus(
            String status) {

        try {

            InterviewStatus interviewStatus;

            try {

                interviewStatus =
                        InterviewStatus.valueOf(
                                status.trim()
                                        .toUpperCase()
                        );

            } catch (IllegalArgumentException e) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Invalid interview status: "
                                                + status,
                                        null
                                )
                        );
            }

            List<InterviewManagementDto> result =
                    interviewRepository
                            .findByStatus(
                                    interviewStatus
                            )
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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to filter interviews",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // INTERVIEW DETAILS
    // =========================================================

    public ResponseEntity<
            ApiResponse<InterviewManagementDto>>
    getInterviewDetails(
            Long interviewId) {

        try {

            Interview interview =
                    interviewRepository
                            .findById(interviewId)
                            .orElse(null);

            if (interview == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Interview not found",
                                        null
                                )
                        );
            }

            InterviewManagementDto dto =
                    toManagementDto(
                            interview
                    );

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve interview details",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // AI-QUALIFIED CANDIDATES FOR INTERVIEW SCHEDULING
    // =========================================================

    public ResponseEntity<ApiResponse<List<EligibleInterviewCandidateDto>>>
    getEligibleInterviewCandidates() {
        try {
            // Results are ordered newest-first, so the first record for each
            // candidate/job pair is the latest screening.
            Map<String, AIResumeScreening> latestScreenings =
                    aiResumeScreeningRepository
                            .findAllByOrderByScreenedAtDesc()
                            .stream()
                            .filter(screening -> screening.getCandidateId() != null
                                    && screening.getJobId() != null)
                            .collect(Collectors.toMap(
                                    screening -> screening.getCandidateId()
                                            + "-" + screening.getJobId(),
                                    Function.identity(),
                                    (first, second) -> first
                            ));

            List<EligibleInterviewCandidateDto> result =
                    applicationRepository.findAll()
                            .stream()
                            .filter(application -> application.getCandidateId() != null
                                    && application.getJobId() != null)
                            // Allow shortlisted applications and applications that
                            // have completed AI screening. The latest screening
                            // result is checked separately below, so rejected
                            // candidates are still excluded.
                            .filter(application -> {
                                com.ems.common.ApplicationStatus status = application.getStatus();
                                return status == com.ems.common.ApplicationStatus.SHORTLISTED
                                        || status == com.ems.common.ApplicationStatus.AI_SCREENED;
                            })
                            .filter(application -> {
                                String key = application.getCandidateId()
                                        + "-" + application.getJobId();
                                AIResumeScreening screening = latestScreenings.get(key);
                                return screening != null && isScreeningEligible(screening);
                            })
                            .filter(application ->
                                    interviewRepository
                                            .findFirstByApplicationIdOrderByInterviewDateTimeDesc(
                                                    application.getApplicationId())
                                            .map(interview ->
                                                    interview.getStatus() != InterviewStatus.SCHEDULED
                                                            && interview.getStatus() != InterviewStatus.RESCHEDULED)
                                            .orElse(true))
                            .map(application -> {
                                AIResumeScreening screening = latestScreenings.get(
                                        application.getCandidateId() + "-" + application.getJobId());

                                Candidate candidate = candidateRepository.findById(
                                        application.getCandidateId()).orElse(null);
                                Job job = jobRepository.findById(
                                        application.getJobId()).orElse(null);

                                return new EligibleInterviewCandidateDto(
                                        application.getCandidateId(),
                                        application.getApplicationId(),
                                        application.getJobId(),
                                        candidate != null ? candidate.getName() : null,
                                        job != null ? job.getTitle() : null,
                                        screening.getScreeningScore(),
                                        screening.getScreeningResult()
                                );
                            })
                            .toList();

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Eligible interview candidates retrieved successfully",
                    result
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve eligible candidates: " + e.getMessage(),
                            null
                    ));
        }
    }

    private boolean isScreeningEligible(AIResumeScreening screening) {
        String result = screening.getScreeningResult();
        if (result == null) {
            return false;
        }

        String normalized = result.trim().toUpperCase();

        // Check negative phrases first to avoid accepting "NOT QUALIFIED".
        if (normalized.contains("NOT QUALIFIED")
                || normalized.contains("NOT_QUALIFIED")
                || normalized.contains("NOT RECOMMENDED")
                || normalized.contains("REJECT")
                || normalized.contains("FAIL")) {
            return false;
        }

        return normalized.contains("QUALIFIED")
                || normalized.contains("RECOMMENDED")
                || normalized.contains("PASS")
                || normalized.contains("SHORTLISTED");
    }



    // Record a final outcome for an interview assigned to the logged-in interviewer.
    @Transactional
    public ResponseEntity<ApiResponse<Interview>> updateInterviewOutcome(
            Long interviewId,
            String status,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Authentication is required", null));
        }

        if (status == null || status.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false,
                            "Status is required: COMPLETED, NOT_ATTENDED, or CANCELLED", null));
        }

        try {
            User interviewer = userRepository
                    .findByEmailIgnoreCase(authentication.getName())
                    .orElse(null);

            if (interviewer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Interviewer account not found", null));
            }

            if (interviewer.getRole() == null
                    || !interviewer.getRole().equalsIgnoreCase("INTERVIEWER")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(false,
                                "Only interviewers can record interview outcomes", null));
            }

            Interview interview = interviewRepository.findById(interviewId).orElse(null);
            if (interview == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "Interview not found", null));
            }

            if (interview.getInterviewerId() == null
                    || !interview.getInterviewerId().equals(interviewer.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(false,
                                "You are not assigned to this interview", null));
            }

            final InterviewStatus outcome;
            try {
                outcome = InterviewStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false,
                                "Invalid outcome. Allowed values: COMPLETED, NOT_ATTENDED, CANCELLED", null));
            }

            if (outcome != InterviewStatus.COMPLETED
                    && outcome != InterviewStatus.NOT_ATTENDED
                    && outcome != InterviewStatus.CANCELLED) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false,
                                "Allowed outcomes: COMPLETED, NOT_ATTENDED, CANCELLED", null));
            }

            interview.setStatus(outcome);
            Interview savedInterview = interviewRepository.saveAndFlush(interview);

            return ResponseEntity.ok(new ApiResponse<>(
                    true, "Interview outcome saved successfully", savedInterview));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false,
                            "Failed to save interview outcome", null));
        }
    }

}

