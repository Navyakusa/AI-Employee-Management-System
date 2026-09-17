package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.AIResumeScreeningRequestDto;
import com.ems.dto.AIResumeScreeningResponseDto;
import com.ems.dto.AIScreeningManagementDto;
import com.ems.dto.AIScreeningStatsDto;
import com.ems.service.AIResumeScreeningService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-resume-screening")
public class AIResumeScreeningController {

    @Autowired
    private AIResumeScreeningService screeningService;

    @PostMapping("/screen")
    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>> screenResume(
            @Valid @RequestBody AIResumeScreeningRequestDto requestDto) {

        return screeningService.screenResume(requestDto);
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<AIResumeScreeningResponseDto>>> getAllScreenings() {

        return screeningService.getAllScreenings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>> getScreeningById(
            @PathVariable Long id) {

        return screeningService.getScreeningById(id);
    }
    @GetMapping("/management")
    public ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
    getScreeningManagementData() {

        return screeningService.getScreeningManagementData();
    }


    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AIScreeningStatsDto>>
    getScreeningStats() {

        return screeningService.getScreeningStats();
    }
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
    searchScreenings(@RequestParam String keyword) {

        return screeningService.searchScreenings(keyword);
    }
    @GetMapping("/result/{result}")
    public ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
    filterByResult(@PathVariable String result) {

        return screeningService.filterByResult(result);
    }
}