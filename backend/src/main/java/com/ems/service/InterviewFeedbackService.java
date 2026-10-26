
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.EvaluationStatus;
import com.ems.common.InterviewStatus;
import com.ems.dto.InterviewFeedbackDto;
import com.ems.dto.InterviewerEvaluationDto;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.InterviewEvaluation;
import com.ems.entity.InterviewFeedback;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewEvaluationRepository;
import com.ems.repository.InterviewFeedbackRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterviewFeedbackService {

    private final InterviewFeedbackRepository feedbackRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final NotificationService notificationService;

    public InterviewFeedbackService(
            InterviewFeedbackRepository feedbackRepository,
            InterviewEvaluationRepository evaluationRepository,
            InterviewRepository interviewRepository,
            UserRepository userRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            NotificationService notificationService) {

        this.feedbackRepository = feedbackRepository;
        this.evaluationRepository = evaluationRepository;
        this.interviewRepository = interviewRepository;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // SUBMIT INTERVIEW FEEDBACK
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<InterviewFeedback>> submitFeedback(
            InterviewFeedbackDto dto,
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(
                            false,
                            "Authentication is required",
                            null));
        }

        if (dto == null || dto.getInterviewId() == null) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "Interview ID is required",
                            null));
        }

        User interviewer = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElse(null);

        if (interviewer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Interviewer account not found",
                            null));
        }

        if (interviewer.getRole() == null
                || !interviewer.getRole().equalsIgnoreCase("INTERVIEWER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(
                            false,
                            "Only interviewers can submit evaluations",
                            null));
        }

        Interview interview = interviewRepository
                .findById(dto.getInterviewId())
                .orElse(null);

        if (interview == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Interview not found",
                            null));
        }

        // Verify that the logged-in interviewer is assigned.
        if (interview.getInterviewerId() == null
                || !interview.getInterviewerId()
                .equals(interviewer.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(
                            false,
                            "You are not assigned to this interview",
                            null));
        }

        // Do not accept feedback for cancelled interviews.
        if (interview.getStatus() == InterviewStatus.CANCELLED) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "Feedback cannot be submitted for a cancelled interview",
                            null));
        }

        // Do not allow feedback to be submitted twice.
        if (feedbackRepository.existsByInterviewId(
                dto.getInterviewId())) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "Evaluation has already been submitted for this interview",
                            null));
        }

        // Also check the separate evaluation table.
        boolean evaluationAlreadySubmitted = evaluationRepository
                .findFirstByInterviewIdOrderBySubmittedAtDesc(
                        dto.getInterviewId())
                .filter(e -> e.getStatus() == EvaluationStatus.SUBMITTED)
                .isPresent();

        if (evaluationAlreadySubmitted) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "An evaluation has already been submitted for this interview",
                            null));
        }

        // Validate every required rating.
        if (!validRating(dto.getTechnicalRating())
                || !validRating(dto.getCommunicationRating())
                || !validRating(dto.getProblemSolvingRating())
                || !validRating(dto.getOverallRating())) {

            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(
                            false,
                            "All ratings must be between 1 and 5",
                            null));
        }

        int overallRating = dto.getOverallRating();

        InterviewFeedback feedback = InterviewFeedback.builder()
                .interviewId(interview.getInterviewId())
                .interviewerId(interviewer.getUserId())
                .rating(dto.getRating() != null
                        ? dto.getRating()
                        : overallRating)
                .technicalRating(dto.getTechnicalRating())
                .communicationRating(dto.getCommunicationRating())
                .problemSolvingRating(dto.getProblemSolvingRating())
                .overallRating(overallRating)
                .strengths(dto.getStrengths())
                .improvementAreas(dto.getImprovementAreas())
                .feedback(dto.getFeedback())
                .recommendation(dto.getRecommendation())
                .submittedAt(LocalDateTime.now())
                .build();

        // Save feedback first.
        InterviewFeedback saved = feedbackRepository.save(feedback);

        // Mark the interview complete only after feedback is saved.
        interview.setStatus(InterviewStatus.COMPLETED);
        interviewRepository.save(interview);

        // Notification failures should not invalidate the evaluation.
        notifyRecruitmentUsersSafely(interview, interviewer);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Interview evaluation submitted successfully",
                        saved));
    }

    // =========================================================
    // INTERVIEWER: MY EVALUATIONS
    // =========================================================

    public ResponseEntity<ApiResponse<List<InterviewerEvaluationDto>>>
    getMyEvaluations(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(
                            false,
                            "Authentication is required",
                            null));
        }

        User interviewer = userRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElse(null);

        if (interviewer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Interviewer account not found",
                            null));
        }

        if (interviewer.getRole() == null
                || !interviewer.getRole().equalsIgnoreCase("INTERVIEWER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(
                            false,
                            "Only interviewers can access their evaluations",
                            null));
        }

        List<Interview> interviews =
                interviewRepository.findByInterviewerId(
                        interviewer.getUserId());

        List<InterviewerEvaluationDto> result = interviews.stream()
                .map(this::toEvaluationDto)
                .toList();

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Interviewer evaluations fetched successfully",
                result));
    }

    // =========================================================
    // GET FEEDBACK BY INTERVIEW ID
    // =========================================================

    public InterviewFeedback getFeedbackByInterview(Long interviewId) {

        if (interviewId == null || interviewId <= 0) {
            return null;
        }

        InterviewFeedback feedback = feedbackRepository
                .findByInterviewId(interviewId)
                .orElse(null);

        if (feedback != null) {
            return feedback;
        }

        // Fall back to the separate submitted evaluation.
        InterviewEvaluation evaluation = evaluationRepository
                .findFirstByInterviewIdOrderBySubmittedAtDesc(interviewId)
                .filter(e -> e.getStatus() == EvaluationStatus.SUBMITTED)
                .orElse(null);

        if (evaluation == null) {
            return null;
        }

        InterviewFeedback result = new InterviewFeedback();

        result.setInterviewId(evaluation.getInterviewId());
        result.setInterviewerId(evaluation.getInterviewerId());
        result.setTechnicalRating(evaluation.getTechnicalSkills());
        result.setCommunicationRating(evaluation.getCommunication());
        result.setProblemSolvingRating(evaluation.getProblemSolving());

        if (evaluation.getOverallRating() != null) {
            int rating = (int) Math.round(
                    evaluation.getOverallRating());

            result.setOverallRating(rating);
            result.setRating(rating);
        }

        result.setStrengths(evaluation.getStrengths());
        result.setImprovementAreas(
                evaluation.getAreasForImprovement());
        result.setSubmittedAt(evaluation.getSubmittedAt());

        return result;
    }

    // =========================================================
    // GET ALL FEEDBACK
    // =========================================================

    public List<InterviewFeedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    // =========================================================
    // BUILD INTERVIEWER EVALUATION DTO
    // =========================================================

    private InterviewerEvaluationDto toEvaluationDto(
            Interview interview) {

        InterviewerEvaluationDto dto =
                new InterviewerEvaluationDto();

        dto.setInterviewId(interview.getInterviewId());
        dto.setCandidateId(interview.getCandidateId());
        dto.setJobId(interview.getJobId());
        dto.setInterviewDateTime(interview.getInterviewDateTime());
        dto.setInterviewMode(interview.getInterviewMode());

        dto.setInterviewStatus(
                interview.getStatus() != null
                        ? interview.getStatus().name()
                        : null);

        if (interview.getCandidateId() != null) {
            Candidate candidate = candidateRepository
                    .findById(interview.getCandidateId())
                    .orElse(null);

            if (candidate != null) {
                dto.setCandidateName(candidate.getName());
                dto.setCandidateEmail(candidate.getEmail());
            }
        }

        if (interview.getJobId() != null) {
            Job job = jobRepository
                    .findById(interview.getJobId())
                    .orElse(null);

            if (job != null) {
                dto.setJobTitle(job.getTitle());
            }
        }

        InterviewFeedback feedback = feedbackRepository
                .findByInterviewId(interview.getInterviewId())
                .orElse(null);

        if (feedback != null) {
            dto.setFeedbackId(feedback.getFeedbackId());
            dto.setTechnicalRating(feedback.getTechnicalRating());
            dto.setCommunicationRating(
                    feedback.getCommunicationRating());
            dto.setProblemSolvingRating(
                    feedback.getProblemSolvingRating());
            dto.setOverallRating(feedback.getOverallRating());
            dto.setStrengths(feedback.getStrengths());
            dto.setImprovementAreas(feedback.getImprovementAreas());
            dto.setFeedback(feedback.getFeedback());
            dto.setRecommendation(feedback.getRecommendation());
            dto.setSubmittedAt(feedback.getSubmittedAt());
            dto.setEvaluationStatus("SUBMITTED");

            return dto;
        }

        InterviewEvaluation evaluation = evaluationRepository
                .findFirstByInterviewIdOrderBySubmittedAtDesc(
                        interview.getInterviewId())
                .filter(e -> e.getStatus() == EvaluationStatus.SUBMITTED)
                .orElse(null);

        if (evaluation == null) {
            dto.setEvaluationStatus("PENDING");
            return dto;
        }

        dto.setTechnicalRating(evaluation.getTechnicalSkills());
        dto.setCommunicationRating(evaluation.getCommunication());
        dto.setProblemSolvingRating(evaluation.getProblemSolving());

        if (evaluation.getOverallRating() != null) {
            dto.setOverallRating(
                    (int) Math.round(evaluation.getOverallRating()));
        }

        dto.setStrengths(evaluation.getStrengths());
        dto.setImprovementAreas(evaluation.getAreasForImprovement());
        dto.setSubmittedAt(evaluation.getSubmittedAt());
        dto.setEvaluationStatus("SUBMITTED");

        return dto;
    }

    // =========================================================
    // RATING VALIDATION
    // =========================================================

    private boolean validRating(Integer rating) {
        return rating != null && rating >= 1 && rating <= 5;
    }

    // =========================================================
    // NOTIFY RECRUITMENT USERS
    // =========================================================

    private void notifyRecruitmentUsersSafely(
            Interview interview,
            User interviewer) {

        try {
            List<User> users = userRepository.findAll();

            for (User user : users) {
                if (user.getRole() == null) {
                    continue;
                }

                String role = user.getRole().toUpperCase();

                if (role.equals("HIRING_MANAGER")
                        || role.equals("RECRUITER")
                        || role.equals("SUPER_ADMIN")) {

                    try {
                        notificationService.createNotification(
                                user.getUserId(),
                                "Interview evaluation submitted for interview "
                                        + interview.getInterviewId()
                                        + " by "
                                        + interviewer.getUserName(),
                                "INTERVIEW_EVALUATION_SUBMITTED");
                    } catch (Exception notificationException) {
                        // A notification failure must not undo feedback.
                        notificationException.printStackTrace();
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
