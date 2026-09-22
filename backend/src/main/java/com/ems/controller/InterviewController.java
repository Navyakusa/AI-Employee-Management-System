package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.AvailableInterviewerDto;
import com.ems.dto.InterviewManagementDto;
import com.ems.dto.InterviewRequestDto;
import com.ems.dto.InterviewStatsDto;
import com.ems.dto.InterviewerCandidateDto;
import com.ems.entity.Interview;
import com.ems.service.InterviewService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewController {

    @Autowired
    private InterviewService interviewService;

    // =========================================================
    // SCHEDULE INTERVIEW
    // =========================================================

    @PostMapping("/schedule")
    public ResponseEntity<ApiResponse<Interview>> scheduleInterview(
            @RequestBody InterviewRequestDto dto) {

        return interviewService.scheduleInterview(dto);
    }

    // =========================================================
    // AVAILABLE INTERVIEWERS
    // =========================================================

    @GetMapping("/available-interviewers")
    public ResponseEntity<ApiResponse<List<AvailableInterviewerDto>>>
    getAvailableInterviewers() {

        return interviewService.getAvailableInterviewers();
    }

    // =========================================================
    // CANDIDATE - MY INTERVIEWS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Interview>>> getMyInterviews(
            Authentication authentication) {

        return interviewService.getMyInterviews(authentication);
    }

    // =========================================================
    // INTERVIEWER - MY CANDIDATES
    // =========================================================

    @GetMapping("/interviewer/my-candidates")
    public ResponseEntity<ApiResponse<List<InterviewerCandidateDto>>>
    getMyCandidates(Authentication authentication) {

        return interviewService.getMyCandidates(authentication);
    }

    // =========================================================
    // INTERVIEWS BY JOB
    // =========================================================

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<Interview>>> getInterviewsByJob(
            @PathVariable Long jobId) {

        return interviewService.getInterviewsByJob(jobId);
    }

    // =========================================================
    // RESCHEDULE INTERVIEW
    // =========================================================

    @PutMapping("/{interviewId}/reschedule")
    public ResponseEntity<ApiResponse<Interview>> rescheduleInterview(
            @PathVariable Long interviewId,
            @RequestBody InterviewRequestDto dto) {

        return interviewService.rescheduleInterview(
                interviewId,
                dto
        );
    }

    // =========================================================
    // UPDATE INTERVIEW STATUS
    // =========================================================

    @PutMapping("/{interviewId}/status")
    public ResponseEntity<ApiResponse<Interview>> updateInterviewStatus(
            @PathVariable Long interviewId,
            @RequestParam String status) {

        return interviewService.updateInterviewStatus(
                interviewId,
                status
        );
    }

    // =========================================================
    // INTERVIEW MANAGEMENT
    // =========================================================

    @GetMapping("/management")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    getInterviewManagementData() {

        return interviewService.getInterviewManagementData();
    }

    // =========================================================
    // INTERVIEW STATISTICS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InterviewStatsDto>>
    getInterviewStats() {

        return interviewService.getInterviewStats();
    }

    // =========================================================
    // UPCOMING INTERVIEWS
    // =========================================================

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    getUpcomingInterviews() {

        return interviewService.getUpcomingInterviews();
    }

    // =========================================================
    // SEARCH INTERVIEWS
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    searchInterviews(
            @RequestParam String keyword) {

        return interviewService.searchInterviews(keyword);
    }

    // =========================================================
    // INTERVIEWS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>>
    getInterviewsByStatus(
            @PathVariable String status) {

        return interviewService.getInterviewsByStatus(status);
    }

    // =========================================================
    // INTERVIEW DETAILS
    // =========================================================

    @GetMapping("/{interviewId}")
    public ResponseEntity<ApiResponse<InterviewManagementDto>>
    getInterviewDetails(
            @PathVariable Long interviewId) {

        return interviewService.getInterviewDetails(interviewId);
    }
}