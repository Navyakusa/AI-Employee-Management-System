
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.EmployeeSettingsDto;
import com.ems.dto.EmployeeSettingsUpdateDto;
import com.ems.service.EmployeeSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee-settings")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeSettingsController {

    private final EmployeeSettingsService employeeSettingsService;

    public EmployeeSettingsController(
            EmployeeSettingsService employeeSettingsService) {

        this.employeeSettingsService = employeeSettingsService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<EmployeeSettingsDto>>
    getMySettings(
            org.springframework.security.core.Authentication authentication) {

        return employeeSettingsService
                .getMySettings(authentication);
    }

    @PutMapping("/my")
    public ResponseEntity<ApiResponse<EmployeeSettingsDto>>
    updateMySettings(
            @RequestBody EmployeeSettingsUpdateDto request,
            org.springframework.security.core.Authentication authentication) {

        return employeeSettingsService
                .updateMySettings(
                        request,
                        authentication
                );
    }
}