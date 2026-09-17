package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.ResumeManagementDto;
import com.ems.dto.ResumeRequestDto;
import com.ems.dto.ResumeResponseDto;
import com.ems.dto.ResumeStatsDto;
import com.ems.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.http.MediaType;
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<ResumeResponseDto>> uploadResume(
            @Valid @ModelAttribute ResumeRequestDto request) {

        return resumeService.uploadResume(request);
    }


    @PostMapping("/create")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> createResume(
            @Valid @RequestBody ResumeRequestDto resumeRequestDto) {

        return resumeService.createResume(
                resumeRequestDto
        );
    }


    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ResumeResponseDto>>> getAllResumes() {

        return resumeService.getAllResumes();
    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> getResumeById(
            @PathVariable Long id) {

        return resumeService.getResumeById(id);
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponseDto>> updateResume(
            @PathVariable Long id,
            @Valid @RequestBody ResumeRequestDto resumeRequestDto) {

        return resumeService.updateResume(
                id,
                resumeRequestDto
        );
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteResume(
            @PathVariable Long id) {

        return resumeService.deleteResume(id);
    }
    @GetMapping("/{id}/view")
    public ResponseEntity
    <?> viewResume(
            @PathVariable Long id) {

        return resumeService.viewResume(id);
    }
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadResume(
            @PathVariable Long id) {

        return resumeService.downloadResume(id);
    }
    @GetMapping("/management")
    public ResponseEntity<ApiResponse<List<ResumeManagementDto>>>
    getResumeManagementData() {

        return resumeService.getResumeManagementData();
    }


    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ResumeStatsDto>>
    getResumeStats() {

        return resumeService.getResumeStats();
    }
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ResumeManagementDto>>>
    searchResumes(
            @RequestParam String keyword) {

        return resumeService.searchResumes(keyword);
    }


    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<ResumeManagementDto>>>
    getResumesByStatus(
            @PathVariable String status) {

        return resumeService.getResumesByStatus(status);
    }
}