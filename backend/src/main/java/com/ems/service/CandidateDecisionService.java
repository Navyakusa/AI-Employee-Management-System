
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.common.InterviewStatus;
import com.ems.dto.*;
import com.ems.entity.*;
import com.ems.mapper.CandidateDecisionMapper;
import com.ems.repository.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CandidateDecisionService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final InterviewEvaluationRepository interviewEvaluationRepository;
    private final CandidateDecisionMapper candidateDecisionMapper;
    private final PythonAIClient pythonAIClient;
    private final CandidateRankingRepository candidateRankingRepository;
    private final AICandidateMatchingRepository aiCandidateMatchingRepository;

    public CandidateDecisionService(
            ApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            InterviewRepository interviewRepository,
            InterviewFeedbackRepository interviewFeedbackRepository,
            InterviewEvaluationRepository interviewEvaluationRepository,
            CandidateDecisionMapper candidateDecisionMapper,
            PythonAIClient pythonAIClient,
            CandidateRankingRepository candidateRankingRepository,
            AICandidateMatchingRepository aiCandidateMatchingRepository
    ) {
        this.applicationRepository =
                applicationRepository;

        this.candidateRepository =
                candidateRepository;

        this.jobRepository =
                jobRepository;

        this.interviewRepository =
                interviewRepository;

        this.interviewFeedbackRepository =
                interviewFeedbackRepository;

        this.interviewEvaluationRepository =
                interviewEvaluationRepository;

        this.candidateDecisionMapper =
                candidateDecisionMapper;

        this.pythonAIClient =
                pythonAIClient;

        this.candidateRankingRepository =
                candidateRankingRepository;

        this.aiCandidateMatchingRepository =
                aiCandidateMatchingRepository;
    }

    // =========================================================
    // ALL DECISIONS
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getAllDecisions(String search) {

        try {
            // Include applications of every status. The all-decisions
            // endpoint should not hide an application because its status
            // is not included in a hard-coded status list.
            List<Application> applications =
                    applicationRepository.findAll();

            List<CandidateDecisionDto> decisions =
                    buildDecisionDtos(applications);

            // Search
            if (search != null &&
                    !search.trim().isEmpty()) {

                String keyword =
                        search.trim().toLowerCase();

                decisions =
                        decisions.stream()
                                .filter(dto ->
                                        contains(
                                                dto.getCandidateName(),
                                                keyword
                                        )
                                                ||
                                                contains(
                                                        dto.getCandidateEmail(),
                                                        keyword
                                                )
                                                ||
                                                contains(
                                                        dto.getJobTitle(),
                                                        keyword
                                                )
                                )
                                .toList();
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate decisions fetched successfully",
                            decisions
                    )
            );

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch candidate decisions: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // PENDING DECISIONS
    // SHORTLISTED + COMPLETED INTERVIEW + FEEDBACK
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getPendingDecisions() {

        try {

            List<CandidateDecisionDto> decisions =
                    new ArrayList<>();

            List<Application> applications =
                    applicationRepository.findByStatusIn(
                            List.of(
                                    ApplicationStatus.SHORTLISTED,
                                    ApplicationStatus.INTERVIEW
                            )
                    );

            for (Application application : applications) {

                if (!isReadyForDecision(application)) {
                    continue;
                }

                CandidateDecisionDto dto =
                        buildDecisionDto(application);

                if (dto != null) {
                    decisions.add(dto);
                }
            }

            // Support old PENDING records
            List<Application> oldPending =
                    applicationRepository.findByStatus(
                            ApplicationStatus.PENDING
                    );

            decisions.addAll(
                    buildDecisionDtos(oldPending)
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Pending candidate decisions fetched successfully",
                            decisions
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
                                    "Failed to fetch pending decisions: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // APPROVED
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getApprovedCandidates() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatusIn(
                            List.of(
                                    ApplicationStatus.SELECTED,
                                    ApplicationStatus.HIRED
                            )
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Approved candidates fetched successfully",
                            buildDecisionDtos(applications)
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
                                    "Failed to fetch approved candidates: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // REJECTED
    // =========================================================

    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getRejectedCandidates() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatus(
                            ApplicationStatus.REJECTED
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Rejected candidates fetched successfully",
                            buildDecisionDtos(applications)
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
                                    "Failed to fetch rejected candidates: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // SINGLE DECISION
    // =========================================================

    public ResponseEntity<
            ApiResponse<CandidateDecisionDto>>
    getDecisionByApplicationId(
            Long applicationId
    ) {

        try {

            Application application =
                    applicationRepository
                            .findById(applicationId)
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

            CandidateDecisionDto dto =
                    buildDecisionDto(application);

            if (dto == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate decision data not found",
                                        null
                                )
                        );
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate decision fetched successfully",
                            dto
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to fetch candidate decision: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // APPROVE
    // =========================================================

    public ResponseEntity<
            ApiResponse<CandidateDecisionDto>>
    approveCandidate(Long applicationId) {

        try {

            Application application =
                    applicationRepository
                            .findById(applicationId)
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

            if (!isDecisionAllowed(application)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate is not ready for final decision. Interview must be completed and feedback must be submitted.",
                                        null
                                )
                        );
            }

            application.setStatus(
                    ApplicationStatus.SELECTED
            );

            Application updated =
                    applicationRepository.save(
                            application
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate approved successfully",
                            buildDecisionDto(updated)
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to approve candidate: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // REJECT
    // =========================================================

    public ResponseEntity<
            ApiResponse<CandidateDecisionDto>>
    rejectCandidate(Long applicationId) {

        try {

            Application application =
                    applicationRepository
                            .findById(applicationId)
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

            if (!isDecisionAllowed(application)) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Candidate is not ready for final decision. Interview must be completed and feedback must be submitted.",
                                        null
                                )
                        );
            }

            application.setStatus(
                    ApplicationStatus.REJECTED
            );

            Application updated =
                    applicationRepository.save(
                            application
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate rejected successfully",
                            buildDecisionDto(updated)
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to reject candidate: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    // =========================================================
    // BUILD DTO LIST
    // =========================================================

    private List<CandidateDecisionDto>
    buildDecisionDtos(
            List<Application> applications
    ) {

        List<CandidateDecisionDto> result =
                new ArrayList<>();

        for (Application application :
                applications) {

            CandidateDecisionDto dto =
                    buildDecisionDto(application);

            if (dto != null) {
                result.add(dto);
            }
        }

        return result;
    }

    // =========================================================
    // BUILD DTO
    // =========================================================

    private CandidateDecisionDto buildDecisionDto(
            Application application
    ) {

        Candidate candidate =
                candidateRepository
                        .findById(
                                application.getCandidateId()
                        )
                        .orElse(null);

        Job job =
                jobRepository
                        .findById(
                                application.getJobId()
                        )
                        .orElse(null);

        if (candidate == null || job == null) {
            return null;
        }

        CandidateDecisionDto dto =
                candidateDecisionMapper
                        .candidateToDto(candidate);

        dto.setApplicationId(
                application.getApplicationId()
        );

        dto.setJobId(job.getId());

        dto.setJobTitle(job.getTitle());

        dto.setStatus(
                application.getStatus() != null
                        ? application.getStatus().name()
                        : null
        );

        dto.setAppliedAt(
                application.getAppliedAt()
        );

        // =====================================================
        // LATEST COMPLETED INTERVIEW WITH FEEDBACK
        // =====================================================

        Optional<Interview> interviewOptional =
                findLatestCompletedInterviewWithFeedback(
                        application.getApplicationId()
                );

        // Older interview records may be linked through candidate and job.
        if (interviewOptional.isEmpty()) {
            interviewOptional =
                    findLatestCompletedInterviewWithFeedbackForCandidateAndJob(
                            candidate.getId(),
                            job.getId()
                    );
        }

        if (interviewOptional.isPresent()) {
            Interview interview = interviewOptional.get();

            dto.setInterviewId(interview.getInterviewId());
            dto.setInterviewStatus(
                    interview.getStatus() != null
                            ? interview.getStatus().name()
                            : null
            );
            dto.setInterviewDateTime(interview.getInterviewDateTime());

            InterviewFeedback feedback =
                    interviewFeedbackRepository
                            .findByInterviewId(interview.getInterviewId())
                            .orElse(null);

            if (feedback != null) {
                Integer score = feedback.getOverallRating();
                if (score == null) {
                    score = feedback.getRating();
                }
                dto.setInterviewScore(score);
                dto.setInterviewRecommendation(feedback.getRecommendation());
                dto.setInterviewFeedback(feedback.getFeedback());
            }
        }

        // =====================================================
        // AI MATCH SCORE
        // Python ranking is preferred.
        // Existing AI matching table is fallback.
        // =====================================================

        Double aiScore = null;

        Optional<CandidateRanking> ranking =
                candidateRankingRepository
                        .findByCandidateIdAndJobId(
                                candidate.getId(),
                                job.getId()
                        );

        if (ranking.isPresent()) {

            aiScore =
                    ranking.get().getMatchScore();
        }

        if (aiScore == null) {

            Optional<AICandidateMatching>
                    matching =
                    aiCandidateMatchingRepository
                            .findFirstByCandidateIdAndJobIdOrderByIdDesc(
                                    candidate.getId(),
                                    job.getId()
                            );

            if (matching.isPresent()) {

                aiScore =
                        matching.get()
                                .getOverallMatchScore();
            }
        }

        dto.setAiMatchPercentage(aiScore);

        return dto;
    }

    // =========================================================
    // READY FOR DECISION
    // =========================================================

    private boolean isReadyForDecision(Application application) {
        if (application == null) {
            return false;
        }

        if (application.getStatus() != ApplicationStatus.SHORTLISTED
                && application.getStatus() != ApplicationStatus.PENDING
                && application.getStatus() != ApplicationStatus.INTERVIEW) {
            return false;
        }

        Long applicationId = application.getApplicationId();
        Long candidateId = application.getCandidateId();
        Long jobId = application.getJobId();

        // First, check completed interviews linked by applicationId.
        Optional<Interview> interview =
                findLatestCompletedInterviewWithFeedback(applicationId);

        // Fallback for older records linked by candidateId and jobId.
        if (interview.isEmpty()
                && candidateId != null
                && jobId != null) {
            interview =
                    findLatestCompletedInterviewWithFeedbackForCandidateAndJob(
                            candidateId,
                            jobId
                    );
        }

        return interview.isPresent();
    }

    /**
     * Returns the newest completed interview that has feedback attached
     * to that same interview. Scheduled/cancelled interviews are ignored.
     */
    private Optional<Interview> findLatestCompletedInterviewWithFeedback(
            Long applicationId
    ) {
        List<Interview> completedInterviews =
                interviewRepository
                        .findByApplicationIdAndStatusOrderByInterviewDateTimeDesc(
                                applicationId,
                                InterviewStatus.COMPLETED
                        );

        for (Interview interview : completedInterviews) {
            if (hasFeedbackOrSubmittedEvaluation(
                    interview.getInterviewId()
            )) {
                return Optional.of(interview);
            }
        }

        return Optional.empty();
    }

    private Optional<Interview> findLatestCompletedInterviewWithFeedbackForCandidateAndJob(
            Long candidateId,
            Long jobId
    ) {
        List<Interview> completedInterviews =
                interviewRepository
                        .findByCandidateIdAndJobIdAndStatusOrderByInterviewDateTimeDesc(
                                candidateId,
                                jobId,
                                InterviewStatus.COMPLETED
                        );

        for (Interview interview : completedInterviews) {
            if (hasFeedbackOrSubmittedEvaluation(
                    interview.getInterviewId()
            )) {
                return Optional.of(interview);
            }
        }

        return Optional.empty();
    }


    private boolean hasFeedbackOrSubmittedEvaluation(Long interviewId) {
        if (interviewFeedbackRepository.existsByInterviewId(interviewId)) {
            return true;
        }

        return interviewEvaluationRepository
                .findFirstByInterviewIdOrderBySubmittedAtDesc(interviewId)
                .map(evaluation -> "SUBMITTED".equalsIgnoreCase(
                        String.valueOf(evaluation.getStatus())
                ))
                .orElse(false);
    }

    private boolean isDecisionAllowed(
            Application application
    ) {

        if (application.getStatus() ==
                ApplicationStatus.PENDING) {

            return true;
        }

        return isReadyForDecision(application);
    }

    // =========================================================
    // AI DECISION RECOMMENDATION
    // =========================================================

    public ResponseEntity<
            ApiResponse<CandidateDecisionResponseDto>>
    recommendDecision(
            CandidateDecisionRequestDto request
    ) {

        try {

            Long jobId =
                    request.getJobId();

            Long candidateId =
                    request.getCandidateId();

            // =====================================================
            // 1. MATCH SCORE
            // =====================================================

            Double matchScore = null;

            Optional<CandidateRanking> ranking =
                    candidateRankingRepository
                            .findByCandidateIdAndJobId(
                                    candidateId,
                                    jobId
                            );

            if (ranking.isPresent()) {

                matchScore =
                        ranking.get().getMatchScore();
            }

            if (matchScore == null) {

                Optional<AICandidateMatching>
                        matching =
                        aiCandidateMatchingRepository
                                .findFirstByCandidateIdAndJobIdOrderByIdDesc(
                                        candidateId,
                                        jobId
                                );

                if (matching.isPresent()) {

                    matchScore =
                            matching.get()
                                    .getOverallMatchScore();
                }
            }

            if (matchScore == null) {

                throw new RuntimeException(
                        "AI match score is not available"
                );
            }

            // =====================================================
            // 2. LATEST INTERVIEW
            // =====================================================

            Interview interview =
                    findLatestCompletedInterviewWithFeedbackForCandidateAndJob(
                            candidateId,
                            jobId
                    ).orElseThrow(() ->
                            new RuntimeException(
                                    "Completed interview with feedback not found"
                            )
                    );

            // =====================================================
            // 3. FEEDBACK
            // =====================================================

            InterviewFeedback feedback =
                    interviewFeedbackRepository
                            .findByInterviewId(
                                    interview.getInterviewId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Interview feedback not found"
                                    )
                            );

            Integer overall =
                    feedback.getOverallRating();

            if (overall == null) {
                overall = feedback.getRating();
            }

            if (overall == null) {

                throw new RuntimeException(
                        "Interview rating is not available"
                );
            }

            // EMS = 1-5
            // Python AI = 1-10

            double overallScore =
                    overall * 2.0;

            double technical =
                    feedback.getTechnicalRating() != null
                            ? feedback.getTechnicalRating() * 2.0
                            : overallScore;

            double communication =
                    feedback.getCommunicationRating() != null
                            ? feedback.getCommunicationRating() * 2.0
                            : overallScore;

            double problemSolving =
                    feedback.getProblemSolvingRating() != null
                            ? feedback.getProblemSolvingRating() * 2.0
                            : overallScore;

            PythonDecisionFeedbackDto
                    pythonFeedback =
                    new PythonDecisionFeedbackDto();

            pythonFeedback.setTechnicalSkills(
                    technical
            );

            pythonFeedback.setCommunication(
                    communication
            );

            pythonFeedback.setProblemSolving(
                    problemSolving
            );

            pythonFeedback.setTeamwork(
                    overallScore
            );

            pythonFeedback.setLeadership(
                    overallScore
            );

            PythonDecisionRequestDto
                    pythonRequest =
                    new PythonDecisionRequestDto();

            pythonRequest.setMatchProbabilityPct(
                    matchScore
            );

            pythonRequest.setInterviewFeedback(
                    pythonFeedback
            );

            // =====================================================
            // 4. CALL PYTHON AI
            // =====================================================

            PythonDecisionResponseDto aiResponse =
                    pythonAIClient
                            .recommendCandidateDecision(
                                    pythonRequest
                            );

            // =====================================================
            // 5. RESPONSE
            // =====================================================

            CandidateDecisionResponseDto response =
                    new CandidateDecisionResponseDto();

            response.setJobId(jobId);

            response.setCandidateId(candidateId);

            response.setMatchProbabilityPct(
                    aiResponse.getMatchProbabilityPct()
            );

            response.setInterviewAverageScore(
                    aiResponse.getInterviewAverageScore()
            );

            response.setCombinedScorePct(
                    aiResponse.getCombinedScorePct()
            );

            response.setRecommendation(
                    aiResponse.getRecommendation()
            );

            response.setRationale(
                    aiResponse.getRationale()
            );

            response.setNote(
                    aiResponse.getNote()
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate decision recommendation generated successfully",
                            response
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
                                    "Failed to generate candidate decision recommendation: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    private boolean contains(
            String value,
            String keyword
    ) {

        return value != null &&
                value.toLowerCase()
                        .contains(keyword);
    }
}

