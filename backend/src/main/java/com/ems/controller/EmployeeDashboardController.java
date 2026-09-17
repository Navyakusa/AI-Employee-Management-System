package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.EmployeeDashboardDto;
import com.ems.service.EmployeeDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee-dashboard")
public class EmployeeDashboardController {

    private final EmployeeDashboardService dashboardService;

    public EmployeeDashboardController(
            EmployeeDashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }


    // =========================================================
    // GET EMPLOYEE DASHBOARD
    // =========================================================

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<EmployeeDashboardDto>>
    getDashboardSummary() {

        return dashboardService.getDashboardSummary();
    }
}