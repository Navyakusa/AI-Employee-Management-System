package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.CandidateDashboardDto;
import com.ems.service.CandidateDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/candidate-dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateDashboardController {

    private final CandidateDashboardService candidateDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CandidateDashboardDto>> getDashboard(
            Authentication authentication
    ) {

        CandidateDashboardDto dashboard =
                candidateDashboardService.getDashboard(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Candidate dashboard retrieved successfully",
                        dashboard
                )
        );
    }
}