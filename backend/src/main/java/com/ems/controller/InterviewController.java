package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.AvailableInterviewerDto;
import com.ems.dto.EligibleInterviewCandidateDto;
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

    @PostMapping("/schedule")
    public ResponseEntity<ApiResponse<Interview>> scheduleInterview(@RequestBody InterviewRequestDto dto) {
        return interviewService.scheduleInterview(dto);
    }

    @GetMapping("/eligible-candidates")
    public ResponseEntity<ApiResponse<List<EligibleInterviewCandidateDto>>> getEligibleInterviewCandidates() {
        return interviewService.getEligibleInterviewCandidates();
    }

    @GetMapping("/available-interviewers")
    public ResponseEntity<ApiResponse<List<AvailableInterviewerDto>>> getAvailableInterviewers() {
        return interviewService.getAvailableInterviewers();
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Interview>>> getMyInterviews(Authentication authentication) {
        return interviewService.getMyInterviews(authentication);
    }

    @GetMapping("/interviewer/my-candidates")
    public ResponseEntity<ApiResponse<List<InterviewerCandidateDto>>> getMyCandidates(Authentication authentication) {
        return interviewService.getMyCandidates(authentication);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<Interview>>> getInterviewsByJob(@PathVariable Long jobId) {
        return interviewService.getInterviewsByJob(jobId);
    }

    @PutMapping("/{interviewId}/reschedule")
    public ResponseEntity<ApiResponse<Interview>> rescheduleInterview(
            @PathVariable Long interviewId, @RequestBody InterviewRequestDto dto) {
        return interviewService.rescheduleInterview(interviewId, dto);
    }

    @PutMapping("/{interviewId}/status")
    public ResponseEntity<ApiResponse<Interview>> updateInterviewStatus(
            @PathVariable Long interviewId, @RequestParam String status) {
        return interviewService.updateInterviewStatus(interviewId, status);
    }

    @GetMapping("/management")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>> getInterviewManagementData() {
        return interviewService.getInterviewManagementData();
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<InterviewStatsDto>> getInterviewStats() {
        return interviewService.getInterviewStats();
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>> getUpcomingInterviews() {
        return interviewService.getUpcomingInterviews();
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>> searchInterviews(@RequestParam String keyword) {
        return interviewService.searchInterviews(keyword);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<InterviewManagementDto>>> getInterviewsByStatus(@PathVariable String status) {
        return interviewService.getInterviewsByStatus(status);
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<ApiResponse<InterviewManagementDto>> getInterviewDetails(@PathVariable Long interviewId) {
        return interviewService.getInterviewDetails(interviewId);
    }
}
