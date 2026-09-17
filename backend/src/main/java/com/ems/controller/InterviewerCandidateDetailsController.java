package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewerCandidateDetailsDto;
import com.ems.service.InterviewerCandidateDetailsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviewer/candidate-details")
public class InterviewerCandidateDetailsController {

    private final InterviewerCandidateDetailsService detailsService;

    public InterviewerCandidateDetailsController(
            InterviewerCandidateDetailsService detailsService) {

        this.detailsService = detailsService;
    }

    @GetMapping("/{candidateId}")
    public ResponseEntity<ApiResponse<InterviewerCandidateDetailsDto>>
    getCandidateDetails(
            Authentication authentication,
            @PathVariable Long candidateId) {

        return detailsService.getCandidateDetails(
                authentication,
                candidateId
        );
    }
}