
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.HiringManagerDashboardDto;
import com.ems.entity.Application;
import com.ems.service.HiringManagerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hiring-manager")
public class HiringManagerController {

    private final HiringManagerService hiringManagerService;

    public HiringManagerController(
            HiringManagerService hiringManagerService) {
        this.hiringManagerService = hiringManagerService;
    }

    // Hiring Manager Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<HiringManagerDashboardDto>>
    getDashboard(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(
                            false,
                            "Authentication is required",
                            null
                    ));
        }

        try {
            HiringManagerDashboardDto dashboard =
                    hiringManagerService.getDashboard(
                            authentication.getName()
                    );

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Hiring manager dashboard fetched successfully",
                    dashboard
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }

    // Shortlisted Candidates
    @GetMapping("/shortlisted-candidates")
    public ResponseEntity<ApiResponse<List<Application>>>
    getShortlistedCandidates(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(
                            false,
                            "Authentication is required",
                            null
                    ));
        }

        try {
            List<Application> candidates =
                    hiringManagerService.getShortlistedCandidates(
                            authentication.getName()
                    );

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Shortlisted candidates fetched successfully",
                    candidates
            ));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(
                            false,
                            e.getMessage(),
                            null
                    ));
        }
    }
}
