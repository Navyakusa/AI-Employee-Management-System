
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.PerformanceEmployeeDto;
import com.ems.dto.PerformanceReviewRequestDto;
import com.ems.dto.PerformanceResponseDto;
import com.ems.dto.PerformanceSummaryDto;
import com.ems.service.PerformanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    private final PerformanceService performanceService;

    public PerformanceController(PerformanceService performanceService) {
        this.performanceService = performanceService;
    }

    // Employee endpoints: view personal performance.
    @GetMapping("/my/summary")
    public ResponseEntity<ApiResponse<PerformanceSummaryDto>>
    getMyPerformanceSummary(Authentication authentication) {
        return performanceService.getMyPerformanceSummary(authentication);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getMyPerformance(Authentication authentication) {
        return performanceService.getMyPerformance(authentication);
    }

    @GetMapping("/my/{performanceId}")
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getMyPerformanceById(
            @PathVariable Long performanceId,
            Authentication authentication) {
        return performanceService.getMyPerformanceById(
                performanceId, authentication);
    }

    // HR endpoints: manage employee performance reviews.
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<PerformanceEmployeeDto>>>
    getEmployeesForReview() {
        return performanceService.getEmployeesForReview();
    }

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    createPerformanceReview(
            @RequestBody PerformanceReviewRequestDto request,
            Authentication authentication) {
        return performanceService.createPerformanceReview(
                request, authentication);
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getAllPerformanceReviews() {
        return performanceService.getAllPerformanceReviews();
    }

    @GetMapping("/reviews/{performanceId}")
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getPerformanceReviewById(
            @PathVariable Long performanceId) {
        return performanceService.getPerformanceReviewById(performanceId);
    }
}
