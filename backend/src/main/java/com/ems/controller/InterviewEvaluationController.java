package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewEvaluationDto;
import com.ems.dto.InterviewEvaluationRequestDto;
import com.ems.dto.InterviewerEvaluationsResponseDto;
import com.ems.service.InterviewEvaluationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interviewer/evaluations")
public class InterviewEvaluationController {

    private final InterviewEvaluationService evaluationService;

    public InterviewEvaluationController(
            InterviewEvaluationService evaluationService) {

        this.evaluationService = evaluationService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<InterviewerEvaluationsResponseDto>>
    getMyEvaluations(
            Authentication authentication) {

        return evaluationService
                .getMyEvaluations(authentication);
    }

    @GetMapping("/{evaluationId}")
    public ResponseEntity<ApiResponse<InterviewEvaluationDto>>
    getEvaluation(
            Authentication authentication,
            @PathVariable Long evaluationId) {

        return evaluationService.getEvaluation(
                authentication,
                evaluationId
        );
    }

    @PostMapping("/interview/{interviewId}")
    public ResponseEntity<ApiResponse<InterviewEvaluationDto>>
    submitEvaluation(
            Authentication authentication,
            @PathVariable Long interviewId,
            @Valid @RequestBody InterviewEvaluationRequestDto request) {

        return evaluationService.submitEvaluation(
                authentication,
                interviewId,
                request
        );
    }
}