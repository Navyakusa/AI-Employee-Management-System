package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewerCandidateDto;
import com.ems.dto.InterviewerCandidatesResponseDto;
import com.ems.service.InterviewerCandidateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/interviewer/candidates")
public class InterviewerCandidateController {

    private final InterviewerCandidateService candidateService;

    public InterviewerCandidateController(
            InterviewerCandidateService candidateService) {

        this.candidateService = candidateService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<InterviewerCandidatesResponseDto>>
    getMyCandidates(Authentication authentication) {

        return candidateService.getMyCandidates(authentication);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<InterviewerCandidateDto>>>
    searchCandidates(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate date) {

        return candidateService.searchCandidates(
                authentication,
                keyword,
                jobId,
                status,
                date
        );
    }

    @GetMapping("/{candidateId}")
    public ResponseEntity<ApiResponse<InterviewerCandidateDto>>
    getCandidateDetails(
            Authentication authentication,
            @PathVariable Long candidateId) {

        return candidateService.getCandidateDetails(
                authentication,
                candidateId
        );
    }
}