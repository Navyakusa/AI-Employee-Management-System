package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.ChangePasswordDto;
import com.ems.dto.RecruiterSettingsResponseDto;
import com.ems.dto.RecruiterSettingsUpdateDto;
import com.ems.service.RecruiterSettingsService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recruiter/settings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RecruiterSettingsController {

    private final RecruiterSettingsService settingsService;


    @GetMapping
    public ResponseEntity<ApiResponse<RecruiterSettingsResponseDto>>
    getSettings(
            Authentication authentication
    ) {

        return settingsService
                .getSettings(authentication);
    }


    @PutMapping
    public ResponseEntity<ApiResponse<RecruiterSettingsResponseDto>>
    updateSettings(
            @RequestBody RecruiterSettingsUpdateDto request,
            Authentication authentication
    ) {

        return settingsService
                .updateSettings(
                        request,
                        authentication
                );
    }


    @PutMapping("/password")
    public ResponseEntity<ApiResponse<Void>>
    changePassword(
            @RequestBody ChangePasswordDto request,
            Authentication authentication
    ) {

        return settingsService
                .changePassword(
                        request,
                        authentication
                );
    }
}