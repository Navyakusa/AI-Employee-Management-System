package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.OnboardingDto;
import com.ems.dto.OnboardingRequestDto;
import com.ems.entity.Candidate;
import com.ems.entity.Onboarding;
import com.ems.repository.CandidateRepository;
import com.ems.repository.OnboardingRepository;
import com.ems.service.OnboardingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final OnboardingRepository onboardingRepository;
    private final CandidateRepository candidateRepository;

    public OnboardingController(
            OnboardingService onboardingService,
            OnboardingRepository onboardingRepository,
            CandidateRepository candidateRepository) {
        this.onboardingService = onboardingService;
        this.onboardingRepository = onboardingRepository;
        this.candidateRepository = candidateRepository;
    }

    // Start onboarding: HR and Super Admin only
    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OnboardingDto>> startOnboarding(
            @RequestBody OnboardingRequestDto request) {
        return onboardingService.startOnboarding(request);
    }

    // View all onboarding records: HR and Super Admin only.
    // Do not grant candidates access to this list endpoint.
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<OnboardingDto>>> getAllOnboarding() {
        return onboardingService.getAllOnboarding();
    }

    // Return only the authenticated candidate's onboarding record.
    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<OnboardingDto>> getMyOnboarding(
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Candidate authentication is required");
        }

        Candidate candidate = candidateRepository
                .findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Candidate not found"));

        // This repository method returns List<Onboarding>, so handle it as a list.
        List<Onboarding> onboardings =
                onboardingRepository.findByCandidateId(candidate.getId());

        if (onboardings == null || onboardings.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Onboarding record not found");
        }

        Onboarding onboarding = onboardings.get(0);

        return onboardingService.getOnboardingById(onboarding.getOnboardingId());
    }

    // HR/Super Admin can access any record; candidates can access only their own.
    @GetMapping("/{onboardingId}")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN', 'CANDIDATE')")
    public ResponseEntity<ApiResponse<OnboardingDto>> getOnboardingById(
            @PathVariable Long onboardingId,
            Authentication authentication) {

        boolean isCandidate = authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_CANDIDATE"));

        if (isCandidate) {
            Onboarding onboarding = onboardingRepository
                    .findById(onboardingId)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Onboarding record not found"));

            Candidate candidate = candidateRepository
                    .findById(onboarding.getCandidateId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Candidate not found"));

            String authenticatedEmail = authentication.getName();

            if (candidate.getEmail() == null
                    || authenticatedEmail == null
                    || !candidate.getEmail().equalsIgnoreCase(authenticatedEmail)) {
                throw new AccessDeniedException(
                        "You cannot view another candidate's onboarding");
            }
        }

        return onboardingService.getOnboardingById(onboardingId);
    }

    // Complete onboarding: HR and Super Admin only
    @PutMapping("/{onboardingId}/complete")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OnboardingDto>> completeOnboarding(
            @PathVariable Long onboardingId) {
        return onboardingService.completeOnboarding(onboardingId);
    }
}
