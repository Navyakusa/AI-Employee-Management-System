package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.OnboardingDto;
import com.ems.dto.OnboardingRequestDto;
import com.ems.service.OnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "http://localhost:5173")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    // Start onboarding after an offer is accepted.
    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OnboardingDto>> startOnboarding(
            @RequestBody OnboardingRequestDto request) {

        return onboardingService.startOnboarding(request);
    }

    // Get all onboarding records.
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<OnboardingDto>>> getAllOnboarding() {

        return onboardingService.getAllOnboarding();
    }

    // Get a specific onboarding record.
    @GetMapping("/{onboardingId}")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OnboardingDto>> getOnboardingById(
            @PathVariable Long onboardingId) {

        return onboardingService.getOnboardingById(onboardingId);
    }

    // Complete onboarding and activate the employee.
    @PutMapping("/{onboardingId}/complete")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OnboardingDto>> completeOnboarding(
            @PathVariable Long onboardingId) {

        return onboardingService.completeOnboarding(onboardingId);
    }
}