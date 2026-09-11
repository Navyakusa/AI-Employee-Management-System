package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.HiringManagerDashboardDto;
import com.ems.service.HiringManagerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hiring-manager")
@CrossOrigin(origins = "http://localhost:5173")
public class HiringManagerController {

    private final HiringManagerService hiringManagerService;

    public HiringManagerController(
            HiringManagerService hiringManagerService
    ) {
        this.hiringManagerService =
                hiringManagerService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<
            ApiResponse<HiringManagerDashboardDto>>
    getDashboard(
            Authentication authentication
    ) {

        try {

            String email =
                    authentication.getName();

            HiringManagerDashboardDto dashboard =
                    hiringManagerService
                            .getDashboard(email);

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