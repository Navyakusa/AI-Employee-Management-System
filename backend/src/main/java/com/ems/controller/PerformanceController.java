package com.ems.controller;

import com.ems.common.ApiResponse;
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

    public PerformanceController(
            PerformanceService performanceService) {

        this.performanceService = performanceService;
    }

    @GetMapping("/my/summary")
    public ResponseEntity<ApiResponse<PerformanceSummaryDto>>
    getMyPerformanceSummary(Authentication authentication) {

        return performanceService
                .getMyPerformanceSummary(authentication);
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getMyPerformance(Authentication authentication) {

        return performanceService
                .getMyPerformance(authentication);
    }

    @GetMapping("/my/{performanceId}")
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getMyPerformanceById(
            @PathVariable Long performanceId,
            Authentication authentication) {

        return performanceService
                .getMyPerformanceById(
                        performanceId,
                        authentication
                );
    }
}