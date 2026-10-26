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
    public ResponseEntity<?>
    getByInterview(
            @PathVariable Long interviewId) {

        if (interviewId == null || interviewId <= 0) {
            return ResponseEntity.badRequest().body(
                    new ApiResponse<>(false, "A valid interview ID is required", null)
            );
        }

        InterviewFeedback feedback =
                feedbackService.getFeedbackByInterview(interviewId);

        if (feedback == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "No feedback has been submitted for this interview yet",
                            null
                    ));
        }

        // Preserve the existing response format when feedback exists.
        return ResponseEntity.ok(feedback);
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