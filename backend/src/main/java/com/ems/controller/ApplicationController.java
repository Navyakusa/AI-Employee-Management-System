package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.CandidateReviewDto;
import com.ems.dto.ShortlistedCandidateDto;
import com.ems.entity.Application;
import com.ems.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {
    private final ApplicationService applicationService;
    @GetMapping
    public ResponseEntity<ApiResponse<List<ShortlistedCandidateDto>>> getAllApplications() {
        return applicationService.getShortlistedCandidates();
    }
    @GetMapping("/{applicationId}/review")
    public ResponseEntity<ApiResponse<CandidateReviewDto>>
    getCandidateReview(
            @PathVariable Long applicationId
    ) {

        return applicationService
                .getCandidateReview(applicationId);
    }
}
