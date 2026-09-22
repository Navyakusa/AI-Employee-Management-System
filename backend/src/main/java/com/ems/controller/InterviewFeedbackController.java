package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewFeedbackDto;
import com.ems.dto.InterviewerEvaluationDto;
import com.ems.entity.InterviewFeedback;
import com.ems.service.InterviewFeedbackService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-feedback")
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewFeedbackController {

    @Autowired
    private InterviewFeedbackService feedbackService;


    // =========================================================
    // SUBMIT EVALUATION
    // =========================================================

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewFeedback>>
    submitFeedback(
            @RequestBody InterviewFeedbackDto dto,
            Authentication authentication) {

        return feedbackService.submitFeedback(
                dto,
                authentication
        );
    }


    // =========================================================
    // INTERVIEWER - MY EVALUATIONS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<InterviewerEvaluationDto>>>
    getMyEvaluations(
            Authentication authentication) {

        return feedbackService.getMyEvaluations(
                authentication
        );
    }


    // =========================================================
    // EVALUATION BY INTERVIEW
    // =========================================================

    @GetMapping("/interview/{interviewId}")
    public ResponseEntity<InterviewFeedback>
    getByInterview(
            @PathVariable Long interviewId) {

        return ResponseEntity.ok(
                feedbackService.getFeedbackByInterview(
                        interviewId
                )
        );
    }


    // =========================================================
    // ALL EVALUATIONS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<InterviewFeedback>>
    getAllFeedback() {

        return ResponseEntity.ok(
                feedbackService.getAllFeedback()
        );
    }
}