package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.service.ScreeningQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/screening-questions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ScreeningQuestionController {

    private final ScreeningQuestionService screeningQuestionService;


    @PostMapping
    public ResponseEntity<ApiResponse<ScreeningQuestionResponseDto>>
    createQuestion(
            @Valid
            @RequestBody ScreeningQuestionRequestDto request
    ) {

        return screeningQuestionService
                .createQuestion(request);
    }


    @GetMapping
    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    getAllQuestions() {

        return screeningQuestionService
                .getAllQuestions();
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ScreeningQuestionResponseDto>>
    updateQuestion(
            @PathVariable Long id,
            @Valid
            @RequestBody ScreeningQuestionRequestDto request
    ) {

        return screeningQuestionService
                .updateQuestion(id, request);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>>
    deleteQuestion(
            @PathVariable Long id
    ) {

        return screeningQuestionService
                .deleteQuestion(id);
    }


    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    searchQuestions(
            @RequestParam String keyword
    ) {

        return screeningQuestionService
                .searchQuestions(keyword);
    }


    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    getByCategory(
            @PathVariable String category
    ) {

        return screeningQuestionService
                .getByCategory(category);
    }


    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ScreeningQuestionStatsDto>>
    getStats() {

        return screeningQuestionService
                .getStats();
    }
    @PostMapping("/save-ai")
    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    saveAIQuestions(
            @RequestBody SaveAIQuestionsRequestDto request
    ) {

        return screeningQuestionService
                .saveAIQuestions(request);
    }
}