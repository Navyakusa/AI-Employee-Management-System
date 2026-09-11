package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>>
    getDashboardSummary() {

        return dashboardService.getDashboardSummary();
    }
    @GetMapping("/applications-by-status")
    public ResponseEntity<ApiResponse<List<ApplicationStatusCountDto>>>
    getApplicationsByStatus() {

        return dashboardService.getApplicationsByStatus();
    }
    @GetMapping("/interviews-by-status")
    public ResponseEntity<ApiResponse<List<InterviewStatusCountDto>>>
    getInterviewsByStatus() {

        return dashboardService.getInterviewsByStatus();
    }
    @GetMapping("/applications-per-job")
    public ResponseEntity<ApiResponse<List<JobApplicationCountDto>>>
    getApplicationsPerJob() {

        return dashboardService.getApplicationsPerJob();
    }
    @GetMapping("/recent-applications")
    public ResponseEntity<ApiResponse<List<RecentApplicationDto>>>
    getRecentApplications() {

        return dashboardService.getRecentApplications();
    }
    @GetMapping("/recent-jobs")
    public ResponseEntity<ApiResponse<List<RecentJobDto>>>
    getRecentJobs() {

        return dashboardService.getRecentJobs();
    }
    @GetMapping("/upcoming-interviews")
    public ResponseEntity<ApiResponse<List<UpcomingInterviewDto>>>
    getUpcomingInterviews() {

        return dashboardService.getUpcomingInterviews();
    }
    @GetMapping("/top-ai-candidates")
    public ResponseEntity<ApiResponse<List<TopCandidateDto>>>
    getTopAICandidates() {

        return dashboardService.getTopAICandidates();
    }
    @GetMapping("/ai-screening")
    public ResponseEntity<ApiResponse<AIScreeningAnalyticsDto>>
    getAIScreeningAnalytics() {

        return dashboardService.getAIScreeningAnalytics();
    }
}