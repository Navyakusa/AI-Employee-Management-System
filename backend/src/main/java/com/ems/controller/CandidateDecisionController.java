package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.CandidateDecisionDto;
import com.ems.dto.CandidateDecisionRequestDto;
import com.ems.dto.CandidateDecisionResponseDto;
import com.ems.service.CandidateDecisionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidate-decisions")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateDecisionController {

    private final CandidateDecisionService candidateDecisionService;

    public CandidateDecisionController(
            CandidateDecisionService candidateDecisionService
    ) {
        this.candidateDecisionService =
                candidateDecisionService;
    }

    // =========================================================
    // ALL DECISIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getAllDecisions(
            @RequestParam(required = false) String search
    ) {

        return candidateDecisionService
                .getAllDecisions(search);
    }

    // =========================================================
    // PENDING DECISIONS
    // =========================================================

    @GetMapping("/pending")
    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getPendingDecisions() {

        return candidateDecisionService
                .getPendingDecisions();
    }

    // =========================================================
    // APPROVED
    // =========================================================

    @GetMapping("/approved")
    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getApprovedCandidates() {

        return candidateDecisionService
                .getApprovedCandidates();
    }

    // =========================================================
    // REJECTED
    // =========================================================

    @GetMapping("/rejected")
    public ResponseEntity<
            ApiResponse<List<CandidateDecisionDto>>>
    getRejectedCandidates() {

        return candidateDecisionService
                .getRejectedCandidates();
    }

    // =========================================================
    // SINGLE DECISION
    // =========================================================

    @GetMapping("/{applicationId}")
    public ResponseEntity<
            ApiResponse<CandidateDecisionDto>>
    getDecisionByApplicationId(
            @PathVariable Long applicationId
    ) {

        return candidateDecisionService
                .getDecisionByApplicationId(applicationId);
    }

    // =========================================================
    // APPROVE
    // =========================================================

    @PatchMapping("/{applicationId}/approve")
    public ResponseEntity<
            ApiResponse<CandidateDecisionDto>>
    approveCandidate(
            @PathVariable Long applicationId
    ) {

        return candidateDecisionService
                .approveCandidate(applicationId);
    }

    // =========================================================
    // REJECT
    // =========================================================

    @PatchMapping("/{applicationId}/reject")
    public ResponseEntity<
            ApiResponse<CandidateDecisionDto>>
    rejectCandidate(
            @PathVariable Long applicationId
    ) {

        return candidateDecisionService
                .rejectCandidate(applicationId);
    }

    // =========================================================
    // AI DECISION RECOMMENDATION
    // =========================================================

    @PostMapping("/recommend")
    public ResponseEntity<
            ApiResponse<CandidateDecisionResponseDto>>
    recommendCandidateDecision(
            @Valid
            @RequestBody CandidateDecisionRequestDto request
    ) {

        return candidateDecisionService
                .recommendDecision(request);
    }
}