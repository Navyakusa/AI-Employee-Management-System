
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewerDashboardDto;
import com.ems.service.InterviewerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviewer-dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewerDashboardController {

    private final InterviewerDashboardService dashboardService;

    public InterviewerDashboardController(
            InterviewerDashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<InterviewerDashboardDto>>
    getDashboard(Authentication authentication) {

        return dashboardService.getDashboard(authentication);
    }
}