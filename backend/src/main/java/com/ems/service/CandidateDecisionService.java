package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.dto.CandidateDecisionDto;
import com.ems.entity.Application;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
import com.ems.entity.InterviewFeedback;
import com.ems.entity.Job;
import com.ems.mapper.CandidateDecisionMapper;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewFeedbackRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CandidateDecisionService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;
    private final CandidateDecisionMapper candidateDecisionMapper;

    public CandidateDecisionService(
            ApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            JobRepository jobRepository,
            InterviewRepository interviewRepository,
            InterviewFeedbackRepository interviewFeedbackRepository,
            CandidateDecisionMapper candidateDecisionMapper
    ) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.interviewRepository = interviewRepository;
        this.interviewFeedbackRepository = interviewFeedbackRepository;
        this.candidateDecisionMapper = candidateDecisionMapper;
    }

    // =========================================================
    // GET ALL CANDIDATE DECISIONS
    // Optional search by candidate name, email, or job title
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getAllDecisions(
            String search
    ) {

        try {

            List<Application> applications =
                    applicationRepository.findByStatusIn(
                            List.of(
                                    ApplicationStatus.PENDING,
                                    ApplicationStatus.SELECTED,
                                    ApplicationStatus.HIRED,
                                    ApplicationStatus.REJECTED
                            )
                    );

            List<CandidateDecisionDto> decisions =
                    buildDecisionDtos(applications);

            // Search
            if (search != null && !search.trim().isEmpty()) {

                String keyword = search.trim().toLowerCase();

                decisions = decisions.stream()
                        .filter(dto ->
                                (dto.getCandidateName() != null
                                        && dto.getCandidateName()
                                        .toLowerCase()
                                        .contains(keyword))
                                        ||
                                        (dto.getCandidateEmail() != null
                                                && dto.getCandidateEmail()
                                                .toLowerCase()
                                                .contains(keyword))
                                        ||
                                        (dto.getJobTitle() != null
                                                && dto.getJobTitle()
                                                .toLowerCase()
                                                .contains(keyword))
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

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    // GET PENDING DECISIONS
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getPendingDecisions() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatus(
                            ApplicationStatus.PENDING
                    );

            List<CandidateDecisionDto> decisions =
                    buildDecisionDtos(applications);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Pending candidate decisions fetched successfully",
                            decisions
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    // GET APPROVED CANDIDATES
    // SELECTED + HIRED
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getApprovedCandidates() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatusIn(
                            List.of(
                                    ApplicationStatus.SELECTED,
                                    ApplicationStatus.HIRED
                            )
                    );

            List<CandidateDecisionDto> decisions =
                    buildDecisionDtos(applications);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Approved candidates fetched successfully",
                            decisions
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    // GET REJECTED CANDIDATES
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getRejectedCandidates() {

        try {

            List<Application> applications =
                    applicationRepository.findByStatus(
                            ApplicationStatus.REJECTED
                    );

            List<CandidateDecisionDto> decisions =
                    buildDecisionDtos(applications);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Rejected candidates fetched successfully",
                            decisions
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    // APPROVE CANDIDATE
    // PENDING → SELECTED
    // =========================================================
    public ResponseEntity<ApiResponse<CandidateDecisionDto>> approveCandidate(
            Long applicationId
    ) {

        try {

            Application application =
                    applicationRepository.findById(applicationId)
                            .orElse(null);

            if (application == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application not found",
                                        null
                                )
                        );
            }

            application.setStatus(ApplicationStatus.SELECTED);

            Application updatedApplication =
                    applicationRepository.save(application);

            CandidateDecisionDto dto =
                    buildDecisionDto(updatedApplication);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate approved successfully",
                            dto
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    // REJECT CANDIDATE
    // ANY STATUS → REJECTED
    // =========================================================
    public ResponseEntity<ApiResponse<CandidateDecisionDto>> rejectCandidate(
            Long applicationId
    ) {

        try {

            Application application =
                    applicationRepository.findById(applicationId)
                            .orElse(null);

            if (application == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Application not found",
                                        null
                                )
                        );
            }

            application.setStatus(ApplicationStatus.REJECTED);

            Application updatedApplication =
                    applicationRepository.save(application);

            CandidateDecisionDto dto =
                    buildDecisionDto(updatedApplication);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate rejected successfully",
                            dto
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    private List<CandidateDecisionDto> buildDecisionDtos(
            List<Application> applications
    ) {

        List<CandidateDecisionDto> decisions =
                new ArrayList<>();

        for (Application application : applications) {

            CandidateDecisionDto dto =
                    buildDecisionDto(application);

            if (dto != null) {
                decisions.add(dto);
            }
        }

        return decisions;
    }

    // =========================================================
    // BUILD ONE COMPLETE DTO
    // =========================================================
    private CandidateDecisionDto buildDecisionDto(
            Application application
    ) {

        Candidate candidate =
                candidateRepository.findById(
                        application.getCandidateId()
                ).orElse(null);

        Job job =
                jobRepository.findById(
                        application.getJobId()
                ).orElse(null);

        if (candidate == null || job == null) {
            return null;
        }

        // Map Candidate → DTO
        CandidateDecisionDto dto =
                candidateDecisionMapper.candidateToDto(candidate);

        // Application information
        dto.setApplicationId(
                application.getApplicationId()
        );

        // Job information
        dto.setJobId(job.getId());
        dto.setJobTitle(job.getTitle());

        // Application status
        dto.setStatus(
                application.getStatus() != null
                        ? application.getStatus().name()
                        : null
        );

        // =====================================================
        // FIND INTERVIEW SCORE
        // =====================================================

        List<Interview> interviews =
                interviewRepository.findByCandidateId(
                        candidate.getId()
                );

        Integer interviewScore = null;

        for (Interview interview : interviews) {

            InterviewFeedback feedback =
                    interviewFeedbackRepository
                            .findByInterviewId(
                                    interview.getInterviewId()
                            )
                            .orElse(null);

            if (feedback != null) {

                interviewScore =
                        feedback.getRating();

                // Use the latest feedback found
                // for this candidate
            }
        }

        dto.setInterviewScore(interviewScore);

        // =====================================================
        // AI MATCH PERCENTAGE
        // =====================================================
        // This will remain null until the ML team provides
        // the AI Candidate Matching result.
        dto.setAiMatchPercentage(null);

        return dto;
    }
}