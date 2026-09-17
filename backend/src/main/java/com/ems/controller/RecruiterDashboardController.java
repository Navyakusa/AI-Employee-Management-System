package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.RecruiterDashboardDto;
import com.ems.service.RecruiterDashboardService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiter")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterDashboardController {

    private final RecruiterDashboardService dashboardService;


    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<RecruiterDashboardDto>>
    getDashboard() {

        return dashboardService.getDashboard();
    }
}