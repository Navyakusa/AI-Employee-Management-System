package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.dto.*;
import com.ems.entity.*;
import com.ems.mapper.CandidateDecisionMapper;
import com.ems.repository.*;
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
    private final PythonAIClient pythonAIClient;
    private final CandidateRankingRepository candidateRankingRepository;

    public CandidateDecisionService(ApplicationRepository applicationRepository, CandidateRepository candidateRepository, JobRepository jobRepository, InterviewRepository interviewRepository, InterviewFeedbackRepository interviewFeedbackRepository, CandidateDecisionMapper candidateDecisionMapper, PythonAIClient pythonAIClient, CandidateRankingRepository candidateRankingRepository) {
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.jobRepository = jobRepository;
        this.interviewRepository = interviewRepository;
        this.interviewFeedbackRepository = interviewFeedbackRepository;
        this.candidateDecisionMapper = candidateDecisionMapper;
        this.pythonAIClient = pythonAIClient;
        this.candidateRankingRepository = candidateRankingRepository;
    }

    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getAllDecisions(String search) {

        try {

            List<Application> applications = applicationRepository.findByStatusIn(List.of(ApplicationStatus.PENDING, ApplicationStatus.SELECTED, ApplicationStatus.HIRED, ApplicationStatus.REJECTED));

            List<CandidateDecisionDto> decisions = buildDecisionDtos(applications);

            // Search
            if (search != null && !search.trim().isEmpty()) {

                String keyword = search.trim().toLowerCase();

                decisions = decisions.stream().filter(dto -> (dto.getCandidateName() != null && dto.getCandidateName().toLowerCase().contains(keyword)) || (dto.getCandidateEmail() != null && dto.getCandidateEmail().toLowerCase().contains(keyword)) || (dto.getJobTitle() != null && dto.getJobTitle().toLowerCase().contains(keyword))).toList();
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidate decisions fetched successfully", decisions));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to fetch candidate decisions: " + e.getMessage(), null));
        }
    }

    // =========================================================
    // GET PENDING DECISIONS
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getPendingDecisions() {

        try {

            List<Application> applications = applicationRepository.findByStatus(ApplicationStatus.PENDING);

            List<CandidateDecisionDto> decisions = buildDecisionDtos(applications);

            return ResponseEntity.ok(new ApiResponse<>(true, "Pending candidate decisions fetched successfully", decisions));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to fetch pending decisions: " + e.getMessage(), null));
        }
    }

    // =========================================================
    // GET APPROVED CANDIDATES
    // SELECTED + HIRED
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getApprovedCandidates() {

        try {

            List<Application> applications = applicationRepository.findByStatusIn(List.of(ApplicationStatus.SELECTED, ApplicationStatus.HIRED));

            List<CandidateDecisionDto> decisions = buildDecisionDtos(applications);

            return ResponseEntity.ok(new ApiResponse<>(true, "Approved candidates fetched successfully", decisions));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to fetch approved candidates: " + e.getMessage(), null));
        }
    }

    // =========================================================
    // GET REJECTED CANDIDATES
    // =========================================================
    public ResponseEntity<ApiResponse<List<CandidateDecisionDto>>> getRejectedCandidates() {

        try {

            List<Application> applications = applicationRepository.findByStatus(ApplicationStatus.REJECTED);

            List<CandidateDecisionDto> decisions = buildDecisionDtos(applications);

            return ResponseEntity.ok(new ApiResponse<>(true, "Rejected candidates fetched successfully", decisions));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to fetch rejected candidates: " + e.getMessage(), null));
        }
    }

    // =========================================================
    // APPROVE CANDIDATE
    // PENDING → SELECTED
    // =========================================================
    public ResponseEntity<ApiResponse<CandidateDecisionDto>> approveCandidate(Long applicationId) {

        try {

            Application application = applicationRepository.findById(applicationId).orElse(null);

            if (application == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, "Application not found", null));
            }

            application.setStatus(ApplicationStatus.SELECTED);

            Application updatedApplication = applicationRepository.save(application);

            CandidateDecisionDto dto = buildDecisionDto(updatedApplication);

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidate approved successfully", dto));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to approve candidate: " + e.getMessage(), null));
        }
    }

    // =========================================================
    // REJECT CANDIDATE
    // ANY STATUS → REJECTED
    // =========================================================
    public ResponseEntity<ApiResponse<CandidateDecisionDto>> rejectCandidate(Long applicationId) {

        try {

            Application application = applicationRepository.findById(applicationId).orElse(null);

            if (application == null) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, "Application not found", null));
            }

            application.setStatus(ApplicationStatus.REJECTED);

            Application updatedApplication = applicationRepository.save(application);

            CandidateDecisionDto dto = buildDecisionDto(updatedApplication);

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidate rejected successfully", dto));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to reject candidate: " + e.getMessage(), null));
        }
    }

    // =========================================================
    // BUILD DTO LIST
    // =========================================================
    private List<CandidateDecisionDto> buildDecisionDtos(List<Application> applications) {

        List<CandidateDecisionDto> decisions = new ArrayList<>();

        for (Application application : applications) {

            CandidateDecisionDto dto = buildDecisionDto(application);

            if (dto != null) {
                decisions.add(dto);
            }
        }

        return decisions;
    }

    // =========================================================
    // BUILD ONE COMPLETE DTO
    // =========================================================
    private CandidateDecisionDto buildDecisionDto(Application application) {

        Candidate candidate = candidateRepository.findById(application.getCandidateId()).orElse(null);

        Job job = jobRepository.findById(application.getJobId()).orElse(null);

        if (candidate == null || job == null) {
            return null;
        }

        // Map Candidate → DTO
        CandidateDecisionDto dto = candidateDecisionMapper.candidateToDto(candidate);

        // Application information
        dto.setApplicationId(application.getApplicationId());

        // Job information
        dto.setJobId(job.getId());
        dto.setJobTitle(job.getTitle());

        // Application status
        dto.setStatus(application.getStatus() != null ? application.getStatus().name() : null);

        // =====================================================
        // FIND INTERVIEW SCORE
        // =====================================================

        List<Interview> interviews = interviewRepository.findByCandidateId(candidate.getId());

        Integer interviewScore = null;

        for (Interview interview : interviews) {

            InterviewFeedback feedback = interviewFeedbackRepository.findByInterviewId(interview.getInterviewId()).orElse(null);

            if (feedback != null) {

                interviewScore = feedback.getRating();

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

    public ResponseEntity<ApiResponse<CandidateDecisionResponseDto>> recommendDecision(CandidateDecisionRequestDto request) {

        try {

            Long jobId = request.getJobId();
            Long candidateId = request.getCandidateId();

            // =====================================================
            // 1. Get existing AI candidate ranking
            // =====================================================

            CandidateRanking ranking = candidateRankingRepository.findByCandidateIdAndJobId(candidateId, jobId).orElseThrow(() -> new RuntimeException("Candidate ranking not found for candidate ID: " + candidateId + " and job ID: " + jobId));

            if (ranking.getMatchScore() == null) {
                throw new RuntimeException("Match score is not available for candidate ID: " + candidateId);
            }

            // =====================================================
            // 2. Get latest interview for candidate + job
            // =====================================================

            Interview interview = interviewRepository.findFirstByCandidateIdAndJobIdOrderByInterviewDateTimeDesc(candidateId, jobId).orElseThrow(() -> new RuntimeException("Interview not found for candidate ID: " + candidateId + " and job ID: " + jobId));

            // =====================================================
            // 3. Get feedback for that interview
            // =====================================================

            InterviewFeedback feedback = interviewFeedbackRepository.findByInterviewId(interview.getInterviewId()).orElseThrow(() -> new RuntimeException("Interview feedback not found for interview ID: " + interview.getInterviewId()));

            if (feedback.getRating() == null) {
                throw new RuntimeException("Interview rating is not available");
            }

            // =====================================================
            // 4. Convert EMS 1-5 rating to Python 1-10 scale
            // =====================================================

            double feedbackScore = feedback.getRating() * 2.0;

            // =====================================================
            // 5. Build Python interview feedback
            // =====================================================
            //
            // EMS currently stores one overall rating.
            // Therefore we use that same overall score for each
            // Python feedback dimension.
            // =====================================================

            PythonDecisionFeedbackDto pythonFeedback = new PythonDecisionFeedbackDto();

            pythonFeedback.setTechnicalSkills(feedbackScore);

            pythonFeedback.setCommunication(feedbackScore);

            pythonFeedback.setProblemSolving(feedbackScore);

            pythonFeedback.setTeamwork(feedbackScore);

            pythonFeedback.setLeadership(feedbackScore);

            // =====================================================
            // 6. Build Python decision request
            // =====================================================

            PythonDecisionRequestDto pythonRequest = new PythonDecisionRequestDto();

            pythonRequest.setMatchProbabilityPct(ranking.getMatchScore());

            pythonRequest.setInterviewFeedback(pythonFeedback);

            // =====================================================
            // 7. Call Python AI
            // =====================================================

            PythonDecisionResponseDto aiResponse = pythonAIClient.recommendCandidateDecision(pythonRequest);

            // =====================================================
            // 8. Build EMS response
            // =====================================================

            CandidateDecisionResponseDto responseDto = new CandidateDecisionResponseDto();

            responseDto.setJobId(jobId);

            responseDto.setCandidateId(candidateId);

            responseDto.setMatchProbabilityPct(aiResponse.getMatchProbabilityPct());

            responseDto.setInterviewAverageScore(aiResponse.getInterviewAverageScore());

            responseDto.setCombinedScorePct(aiResponse.getCombinedScorePct());

            responseDto.setRecommendation(aiResponse.getRecommendation());

            responseDto.setRationale(aiResponse.getRationale());

            responseDto.setNote(aiResponse.getNote());

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidate decision recommendation generated successfully", responseDto));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to generate candidate decision recommendation: " + e.getMessage(), null));
        }
    }
}