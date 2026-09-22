package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewFeedbackDto;
import com.ems.dto.InterviewerEvaluationDto;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.InterviewFeedback;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewFeedbackRepository;
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

@Service
public class InterviewFeedbackService {

    @Autowired
    private InterviewFeedbackRepository feedbackRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private NotificationService notificationService;


    // =========================================================
    // SUBMIT INTERVIEW EVALUATION
    // =========================================================

    public ResponseEntity<ApiResponse<InterviewFeedback>> submitFeedback(
            InterviewFeedbackDto dto,
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

            if (dto.getInterviewId() == null) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Interview ID is required",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Find logged-in interviewer
            // -------------------------------------------------

            User interviewer =
                    userRepository
                            .findByEmailIgnoreCase(
                                    authentication.getName()
                            )
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

            if (interviewer.getRole() == null ||
                    !interviewer.getRole()
                            .equalsIgnoreCase("INTERVIEWER")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only interviewers can submit evaluations",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Find interview
            // -------------------------------------------------

            Interview interview =
                    interviewRepository
                            .findById(dto.getInterviewId())
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

            // -------------------------------------------------
            // Verify interviewer is assigned
            // -------------------------------------------------

            if (interview.getInterviewerId() == null ||
                    !interview.getInterviewerId()
                            .equals(interviewer.getUserId())) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "You are not assigned to this interview",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Prevent duplicate evaluation
            // -------------------------------------------------

            if (feedbackRepository.existsByInterviewId(
                    dto.getInterviewId())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Evaluation has already been submitted for this interview",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Validate ratings
            // -------------------------------------------------

            if (!validRating(dto.getTechnicalRating()) ||
                    !validRating(dto.getCommunicationRating()) ||
                    !validRating(dto.getProblemSolvingRating()) ||
                    !validRating(dto.getOverallRating())) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "All ratings must be between 1 and 5",
                                        null
                                )
                        );
            }

            // -------------------------------------------------
            // Create feedback
            // -------------------------------------------------

            int overallRating =
                    dto.getOverallRating();

            InterviewFeedback feedback =
                    InterviewFeedback.builder()
                            .interviewId(
                                    interview.getInterviewId()
                            )
                            .interviewerId(
                                    interviewer.getUserId()
                            )
                            .rating(
                                    dto.getRating() != null
                                            ? dto.getRating()
                                            : overallRating
                            )
                            .technicalRating(
                                    dto.getTechnicalRating()
                            )
                            .communicationRating(
                                    dto.getCommunicationRating()
                            )
                            .problemSolvingRating(
                                    dto.getProblemSolvingRating()
                            )
                            .overallRating(
                                    overallRating
                            )
                            .strengths(
                                    dto.getStrengths()
                            )
                            .improvementAreas(
                                    dto.getImprovementAreas()
                            )
                            .feedback(
                                    dto.getFeedback()
                            )
                            .recommendation(
                                    dto.getRecommendation()
                            )
                            .submittedAt(
                                    LocalDateTime.now()
                            )
                            .build();

            InterviewFeedback saved =
                    feedbackRepository.save(feedback);

            // -------------------------------------------------
            // Notify HR / recruitment users
            // -------------------------------------------------

            notifyRecruitmentUsers(
                    interview,
                    interviewer
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "Interview evaluation submitted successfully",
                                    saved
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to submit evaluation: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // MY EVALUATIONS
    // =========================================================

    public ResponseEntity<ApiResponse<List<InterviewerEvaluationDto>>>
    getMyEvaluations(Authentication authentication) {

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

            User interviewer =
                    userRepository
                            .findByEmailIgnoreCase(
                                    authentication.getName()
                            )
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

            if (interviewer.getRole() == null ||
                    !interviewer.getRole()
                            .equalsIgnoreCase("INTERVIEWER")) {

                return ResponseEntity
                        .status(HttpStatus.FORBIDDEN)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Only interviewers can access their evaluations",
                                        null
                                )
                        );
            }

            // All interviews assigned to this interviewer
            List<Interview> interviews =
                    interviewRepository.findByInterviewerId(
                            interviewer.getUserId()
                    );

            List<InterviewerEvaluationDto> result =
                    interviews.stream()
                            .map(this::toEvaluationDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interviewer evaluations fetched successfully",
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
                                    "Failed to fetch evaluations",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET EVALUATION FOR INTERVIEW
    // =========================================================

    public InterviewFeedback getFeedbackByInterview(
            Long interviewId) {

        return feedbackRepository
                .findByInterviewId(interviewId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Evaluation not found for interview"
                        )
                );
    }


    // =========================================================
    // ALL FEEDBACK
    // =========================================================

    public List<InterviewFeedback> getAllFeedback() {

        return feedbackRepository.findAll();
    }


    // =========================================================
    // BUILD EVALUATION DTO
    // =========================================================

    private InterviewerEvaluationDto toEvaluationDto(
            Interview interview) {

        InterviewerEvaluationDto dto =
                new InterviewerEvaluationDto();

        dto.setInterviewId(
                interview.getInterviewId()
        );

        dto.setCandidateId(
                interview.getCandidateId()
        );

        dto.setJobId(
                interview.getJobId()
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

            Job job =
                    jobRepository
                            .findById(
                                    interview.getJobId()
                            )
                            .orElse(null);

            if (job != null) {

                dto.setJobTitle(
                        job.getTitle()
                );
            }
        }

        // -------------------------------------------------
        // Existing evaluation
        // -------------------------------------------------

        InterviewFeedback feedback =
                feedbackRepository
                        .findByInterviewId(
                                interview.getInterviewId()
                        )
                        .orElse(null);

        if (feedback == null) {

            dto.setEvaluationStatus(
                    "PENDING"
            );

        } else {

            dto.setFeedbackId(
                    feedback.getFeedbackId()
            );

            dto.setTechnicalRating(
                    feedback.getTechnicalRating()
            );

            dto.setCommunicationRating(
                    feedback.getCommunicationRating()
            );

            dto.setProblemSolvingRating(
                    feedback.getProblemSolvingRating()
            );

            dto.setOverallRating(
                    feedback.getOverallRating()
            );

            dto.setStrengths(
                    feedback.getStrengths()
            );

            dto.setImprovementAreas(
                    feedback.getImprovementAreas()
            );

            dto.setFeedback(
                    feedback.getFeedback()
            );

            dto.setRecommendation(
                    feedback.getRecommendation()
            );

            dto.setSubmittedAt(
                    feedback.getSubmittedAt()
            );

            dto.setEvaluationStatus(
                    "SUBMITTED"
            );
        }

        return dto;
    }


    // =========================================================
    // RATING VALIDATION
    // =========================================================

    private boolean validRating(Integer rating) {

        return rating != null &&
                rating >= 1 &&
                rating <= 5;
    }


    // =========================================================
    // NOTIFY RECRUITMENT USERS
    // =========================================================

    private void notifyRecruitmentUsers(
            Interview interview,
            User interviewer) {

        try {

            List<User> users =
                    userRepository.findAll();

            for (User user : users) {

                if (user.getRole() == null) {
                    continue;
                }

                String role =
                        user.getRole().toUpperCase();

                if (role.equals("HIRING_MANAGER") ||
                        role.equals("RECRUITER") ||
                        role.equals("SUPER_ADMIN")) {

                    notificationService.createNotification(
                            user.getUserId(),
                            "Interview evaluation submitted for interview "
                                    + interview.getInterviewId()
                                    + " by "
                                    + interviewer.getUserName(),
                            "INTERVIEW_EVALUATION_SUBMITTED"
                    );
                }
            }

        } catch (Exception e) {

            // Notification failure should not
            // invalidate the saved evaluation.
            e.printStackTrace();
        }
    }
}