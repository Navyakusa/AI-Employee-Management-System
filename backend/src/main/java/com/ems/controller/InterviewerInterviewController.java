package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewerInterviewDto;
import com.ems.dto.MyInterviewsResponseDto;
import com.ems.service.InterviewerInterviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/interviewer/interviews")
public class InterviewerInterviewController {

    private final InterviewerInterviewService interviewerInterviewService;

    public InterviewerInterviewController(
            InterviewerInterviewService interviewerInterviewService) {

        this.interviewerInterviewService =
                interviewerInterviewService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<MyInterviewsResponseDto>> getMyInterviews(
            Authentication authentication) {

        return interviewerInterviewService
                .getMyInterviews(authentication);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<InterviewerInterviewDto>>>
    searchMyInterviews(
            Authentication authentication,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDate date) {

        return interviewerInterviewService.searchMyInterviews(
                authentication,
                keyword,
                status,
                date
        );
    }

    @GetMapping("/{interviewId}")
    public ResponseEntity<ApiResponse<InterviewerInterviewDto>>
    getInterviewDetails(
            Authentication authentication,
            @PathVariable Long interviewId) {

        return interviewerInterviewService
                .getInterviewDetails(
                        authentication,
                        interviewId
                );
    }
}