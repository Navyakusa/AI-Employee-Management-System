package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.dto.CandidateReviewDto;
import com.ems.dto.InterviewEligibleApplicationDto;
import com.ems.dto.ShortlistedCandidateDto;
import com.ems.entity.Application;
import com.ems.service.ApplicationService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService applicationService;


    // =========================================================
    // GET SHORTLISTED APPLICATIONS
    // Existing endpoint
    // =========================================================

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<ShortlistedCandidateDto>>>
    getAllApplications() {

        return applicationService
                .getShortlistedCandidates();
    }


    // =========================================================
    // GET APPLICATIONS ELIGIBLE FOR INTERVIEW
    // Recruiter Interview Scheduling
    // =========================================================

    @GetMapping("/eligible-for-interview")
    public ResponseEntity<
            ApiResponse<List<InterviewEligibleApplicationDto>>>
    getApplicationsEligibleForInterview() {

        return applicationService
                .getApplicationsEligibleForInterview();
    }


    // =========================================================
    // CANDIDATE - APPLY FOR JOB
    // =========================================================

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<ApiResponse<Application>>
    applyForJob(
            @PathVariable Long jobId,
            Authentication authentication
    ) {

        return applicationService
                .applyForJob(
                        jobId,
                        authentication.getName()
                );
    }


    // =========================================================
    // CANDIDATE - MY APPLICATIONS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Application>>>
    getMyApplications(
            Authentication authentication
    ) {

        return applicationService
                .getMyApplications(
                        authentication.getName()
                );
    }


    // =========================================================
    // HR / RECRUITER - CANDIDATE REVIEW
    // =========================================================

    @GetMapping("/{applicationId}/review")
    public ResponseEntity<ApiResponse<CandidateReviewDto>>
    getCandidateReview(
            @PathVariable Long applicationId
    ) {

        return applicationService
                .getCandidateReview(
                        applicationId
                );
    }


    // =========================================================
    // CANDIDATE - WITHDRAW APPLICATION
    // =========================================================

    @PutMapping("/{applicationId}/withdraw")
    public ResponseEntity<ApiResponse<Application>>
    withdrawApplication(
            @PathVariable Long applicationId,
            Authentication authentication
    ) {

        return applicationService
                .withdrawApplication(
                        applicationId,
                        authentication.getName()
                );
    }


    // =========================================================
    // HR / RECRUITER - SHORTLIST CANDIDATE
    // =========================================================

    @PutMapping("/shortlist")
    public ResponseEntity<ApiResponse<Application>>
    shortlistCandidate(
            @RequestParam Long candidateId,
            @RequestParam Long jobId
    ) {

        return applicationService
                .shortlistCandidate(
                        candidateId,
                        jobId
                );
    }


    // =========================================================
    // HR / HIRING MANAGER
    // ACCEPT / REJECT APPLICATION
    // =========================================================

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<ApiResponse<Application>>
    updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam ApplicationStatus status
    ) {

        return applicationService
                .updateApplicationStatus(
                        applicationId,
                        status
                );
    }
}