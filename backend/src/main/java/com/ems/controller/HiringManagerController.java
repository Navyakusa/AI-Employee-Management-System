package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.HiringManagerDashboardDto;
import com.ems.service.HiringManagerService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hiring-manager")
public class HiringManagerController {

    private final HiringManagerService hiringManagerService;

    public HiringManagerController(
            HiringManagerService hiringManagerService
    ) {
        this.hiringManagerService = hiringManagerService;
    }

    // =========================================================
    // HIRING MANAGER DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<HiringManagerDashboardDto>>
    getDashboard(Authentication authentication) {

        try {

            if (authentication == null) {

                return ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Authentication is required",
                                        null
                                )
                        );
            }

            String email = authentication.getName();

            HiringManagerDashboardDto dashboard =
                    hiringManagerService.getDashboard(email);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Hiring manager dashboard fetched successfully",
                            dashboard
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }
}