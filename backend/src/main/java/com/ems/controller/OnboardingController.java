package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.OnboardingDto;
import com.ems.dto.OnboardingRequestDto;
import com.ems.service.OnboardingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(
            OnboardingService onboardingService) {

        this.onboardingService = onboardingService;
    }


    // START ONBOARDING

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<OnboardingDto>>
    startOnboarding(
            @RequestBody OnboardingRequestDto request) {

        return onboardingService
                .startOnboarding(request);
    }


    // GET ALL

    @GetMapping
    public ResponseEntity<ApiResponse<List<OnboardingDto>>>
    getAllOnboarding() {

        return onboardingService
                .getAllOnboarding();
    }


    // GET BY ID

    @GetMapping("/{onboardingId}")
    public ResponseEntity<ApiResponse<OnboardingDto>>
    getOnboardingById(
            @PathVariable Long onboardingId) {

        return onboardingService
                .getOnboardingById(onboardingId);
    }
}