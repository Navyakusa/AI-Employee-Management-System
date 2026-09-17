package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.EvaluationStatus;
import com.ems.dto.InterviewEvaluationDto;
import com.ems.dto.InterviewEvaluationRequestDto;
import com.ems.dto.InterviewerEvaluationsResponseDto;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.InterviewEvaluation;
import com.ems.entity.Job;
import com.ems.entity.User;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewEvaluationRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class InterviewEvaluationService {

    private final InterviewEvaluationRepository evaluationRepository;
    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    public InterviewEvaluationService(
            InterviewEvaluationRepository evaluationRepository,
            InterviewRepository interviewRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            UserRepository userRepository) {

        this.evaluationRepository = evaluationRepository;
        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
    }

    public ResponseEntity<ApiResponse<InterviewerEvaluationsResponseDto>>
    getMyEvaluations(Authentication authentication) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        List<InterviewEvaluation> evaluations =
                evaluationRepository.findByInterviewerId(interviewerId);

        List<InterviewEvaluationDto> result =
                convertToDtos(evaluations);

        long pendingCount =
                evaluationRepository.countByInterviewerIdAndStatus(
                        interviewerId,
                        EvaluationStatus.DRAFT
                );

        long submittedCount =
                evaluationRepository.countByInterviewerIdAndStatus(
                        interviewerId,
                        EvaluationStatus.SUBMITTED
                );

        InterviewerEvaluationsResponseDto response =
                new InterviewerEvaluationsResponseDto(
                        pendingCount,
                        submittedCount,
                        (long) evaluations.size(),
                        result
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Evaluations retrieved successfully",
                        response
                )
        );
    }

    public ResponseEntity<ApiResponse<InterviewEvaluationDto>>
    getEvaluation(
            Authentication authentication,
            Long evaluationId) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        InterviewEvaluation evaluation =
                evaluationRepository.findById(evaluationId)
                        .orElse(null);

        if (evaluation == null) {
            return ResponseEntity.status(404).body(
                    new ApiResponse<>(
                            false,
                            "Evaluation not found",
                            null
                    )
            );
        }

        if (!interviewerId.equals(evaluation.getInterviewerId())) {
            return ResponseEntity.status(403).body(
                    new ApiResponse<>(
                            false,
                            "You are not assigned to this evaluation",
                            null
                    )
            );
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Evaluation retrieved successfully",
                        toDto(evaluation)
                )
        );
    }

    public ResponseEntity<ApiResponse<InterviewEvaluationDto>>
    submitEvaluation(
            Authentication authentication,
            Long interviewId,
            InterviewEvaluationRequestDto request) {

        User user = getLoggedInUser(authentication);

        Long interviewerId = user.getUserId();

        Interview interview =
                interviewRepository.findById(interviewId)
                        .orElse(null);

        if (interview == null) {
            return ResponseEntity.status(404).body(
                    new ApiResponse<>(
                            false,
                            "Interview not found",
                            null
                    )
            );
        }

        if (!interviewerId.equals(interview.getInterviewerId())) {
            return ResponseEntity.status(403).body(
                    new ApiResponse<>(
                            false,
                            "You are not assigned to this interview",
                            null
                    )
            );
        }

        InterviewEvaluation evaluation =
                evaluationRepository
                        .findByInterviewIdAndInterviewerId(
                                interviewId,
                                interviewerId
                        )
                        .orElse(null);

        if (evaluation == null) {

            evaluation = new InterviewEvaluation();

            evaluation.setInterviewId(interviewId);
            evaluation.setCandidateId(
                    interview.getCandidateId()
            );
            evaluation.setInterviewerId(interviewerId);
        }

        evaluation.setTechnicalSkills(
                request.getTechnicalSkills()
        );

        evaluation.setCommunication(
                request.getCommunication()
        );

        evaluation.setProblemSolving(
                request.getProblemSolving()
        );

        double calculatedRating =
                (
                        request.getTechnicalSkills()
                                + request.getCommunication()
                                + request.getProblemSolving()
                ) / 3.0;

        evaluation.setOverallRating(
                request.getOverallRating() != null
                        ? request.getOverallRating()
                        : calculatedRating
        );

        evaluation.setStrengths(
                request.getStrengths()
        );

        evaluation.setAreasForImprovement(
                request.getAreasForImprovement()
        );

        evaluation.setStatus(
                EvaluationStatus.SUBMITTED
        );

        evaluation.setSubmittedAt(
                LocalDateTime.now()
        );

        InterviewEvaluation saved =
                evaluationRepository.save(evaluation);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Interview evaluation submitted successfully",
                        toDto(saved)
                )
        );
    }

    private User getLoggedInUser(
            Authentication authentication) {

        String email = authentication.getName();

        return userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        ));
    }

    private List<InterviewEvaluationDto> convertToDtos(
            List<InterviewEvaluation> evaluations) {

        List<InterviewEvaluationDto> result =
                new ArrayList<>();

        for (InterviewEvaluation evaluation : evaluations) {
            result.add(toDto(evaluation));
        }

        return result;
    }

    private InterviewEvaluationDto toDto(
            InterviewEvaluation evaluation) {

        Interview interview =
                interviewRepository
                        .findById(evaluation.getInterviewId())
                        .orElse(null);

        Candidate candidate = null;
        Job job = null;

        if (interview != null) {

            candidate =
                    candidateRepository
                            .findById(interview.getCandidateId())
                            .orElse(null);

            job =
                    jobRepository
                            .findById(interview.getJobId())
                            .orElse(null);
        }

        return new InterviewEvaluationDto(

                evaluation.getEvaluationId(),

                evaluation.getInterviewId(),

                evaluation.getCandidateId(),

                candidate != null
                        ? candidate.getName()
                        : null,

                interview != null
                        ? interview.getJobId()
                        : null,

                job != null
                        ? job.getTitle()
                        : null,

                interview != null
                        ? interview.getInterviewDateTime()
                        : null,

                evaluation.getTechnicalSkills(),

                evaluation.getCommunication(),

                evaluation.getProblemSolving(),

                evaluation.getOverallRating(),

                evaluation.getStrengths(),

                evaluation.getAreasForImprovement(),

                evaluation.getStatus() != null
                        ? evaluation.getStatus().name()
                        : null,

                evaluation.getSubmittedAt()
        );
    }
}