package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.InterviewQuestionRequestDto;
import com.ems.dto.InterviewQuestionResponseDto;
import com.ems.service.InterviewQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interview-questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class InterviewQuestionController {

    private final InterviewQuestionService interviewQuestionService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<InterviewQuestionResponseDto>>
    generateInterviewQuestions(
            @Valid
            @RequestBody InterviewQuestionRequestDto request) {

        return interviewQuestionService
                .generateQuestions(request);
    }
}