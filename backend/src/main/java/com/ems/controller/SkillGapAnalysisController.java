package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.SkillGapAnalysisRequestDto;
import com.ems.dto.SkillGapAnalysisResponseDto;
import com.ems.service.SkillGapAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skill-gap-analysis")
@RequiredArgsConstructor
public class SkillGapAnalysisController {

    private final SkillGapAnalysisService skillGapAnalysisService;


    // =========================================================
    // AI SKILL GAP ANALYSIS
    // POST /api/skill-gap-analysis/analyze
    // =========================================================

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<SkillGapAnalysisResponseDto>>
    analyzeSkillGap(
            @Valid @RequestBody SkillGapAnalysisRequestDto requestDto) {

        return skillGapAnalysisService.analyzeSkillGap(requestDto);
    }


    // =========================================================
    // GET ALL SKILL GAP ANALYSES
    // GET /api/skill-gap-analysis/all
    // =========================================================

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResponseDto>>>
    getAllAnalyses() {

        return skillGapAnalysisService.getAllAnalyses();
    }


    // =========================================================
    // GET SKILL GAP ANALYSIS BY ID
    // GET /api/skill-gap-analysis/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkillGapAnalysisResponseDto>>
    getAnalysisById(
            @PathVariable Long id) {

        return skillGapAnalysisService.getAnalysisById(id);
    }


    // =========================================================
    // GET SKILL GAP ANALYSES BY JOB
    // GET /api/skill-gap-analysis/job/{jobId}
    // =========================================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResponseDto>>>
    getAnalysesByJob(
            @PathVariable Long jobId) {

        return skillGapAnalysisService.getAnalysesByJob(jobId);
    }
}