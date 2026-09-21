package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.CandidateProfileDto;
import com.ems.dto.CandidateProfileUpdateDto;
import com.ems.service.CandidateProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidate-profile")
@CrossOrigin(origins = "http://localhost:5173")
public class CandidateProfileController {

    private final CandidateProfileService candidateProfileService;

    public CandidateProfileController(
            CandidateProfileService candidateProfileService
    ) {
        this.candidateProfileService = candidateProfileService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> getMyProfile(
            Authentication authentication
    ) {

        return candidateProfileService.getMyProfile(
                authentication.getName()
        );
    }

    @PutMapping("/my")
    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateMyProfile(
            Authentication authentication,
            @RequestBody CandidateProfileUpdateDto updateDto
    ) {

        return candidateProfileService.updateMyProfile(
                authentication.getName(),
                updateDto
        );
    }
}