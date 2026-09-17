package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.Job;
import com.ems.entity.ScreeningQuestion;
import com.ems.repository.JobRepository;
import com.ems.repository.ScreeningQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScreeningQuestionService {

    private final ScreeningQuestionRepository questionRepository;
    private final JobRepository jobRepository;


    // =====================================================
    // CREATE
    // =====================================================

    public ResponseEntity<ApiResponse<ScreeningQuestionResponseDto>>
    createQuestion(ScreeningQuestionRequestDto request) {

        try {

            if (request.getJobId() != null &&
                    !jobRepository.existsById(request.getJobId())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Job not found",
                                null
                        ));
            }

            ScreeningQuestion question =
                    new ScreeningQuestion();

            question.setQuestion(request.getQuestion());
            question.setCategory(request.getCategory());
            question.setJobId(request.getJobId());
            question.setDifficulty(request.getDifficulty());

            question.setActive(
                    request.getActive() == null
                            ? true
                            : request.getActive()
            );

            question.setSource("MANUAL");

            ScreeningQuestion saved =
                    questionRepository.save(question);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            true,
                            "Screening question created successfully",
                            toDto(saved)
                    ));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to create screening question: "
                                    + e.getMessage(),
                            null
                    ));
        }
    }


    // =====================================================
    // GET ALL
    // =====================================================

    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    getAllQuestions() {

        try {

            List<ScreeningQuestionResponseDto> result =
                    questionRepository.findAll()
                            .stream()
                            .map(this::toDto)
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Screening questions retrieved successfully",
                            result
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve screening questions",
                            null
                    ));
        }
    }


    // =====================================================
    // UPDATE
    // =====================================================

    public ResponseEntity<ApiResponse<ScreeningQuestionResponseDto>>
    updateQuestion(
            Long id,
            ScreeningQuestionRequestDto request
    ) {

        try {

            ScreeningQuestion question =
                    questionRepository
                            .findById(id)
                            .orElse(null);

            if (question == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Screening question not found",
                                null
                        ));
            }

            if (request.getJobId() != null &&
                    !jobRepository.existsById(request.getJobId())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Job not found",
                                null
                        ));
            }

            question.setQuestion(request.getQuestion());
            question.setCategory(request.getCategory());
            question.setJobId(request.getJobId());
            question.setDifficulty(request.getDifficulty());

            if (request.getActive() != null) {
                question.setActive(request.getActive());
            }

            ScreeningQuestion saved =
                    questionRepository.save(question);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Screening question updated successfully",
                            toDto(saved)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to update screening question",
                            null
                    ));
        }
    }


    // =====================================================
    // DELETE
    // =====================================================

    public ResponseEntity<ApiResponse<String>>
    deleteQuestion(Long id) {

        if (!questionRepository.existsById(id)) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Screening question not found",
                            null
                    ));
        }

        questionRepository.deleteById(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Screening question deleted successfully",
                        null
                )
        );
    }


    // =====================================================
    // SEARCH
    // =====================================================

    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    searchQuestions(String keyword) {

        String search =
                keyword == null
                        ? ""
                        : keyword.trim().toLowerCase();

        List<ScreeningQuestionResponseDto> result =
                questionRepository.findAll()
                        .stream()
                        .map(this::toDto)
                        .filter(dto ->
                                contains(dto.getQuestion(), search)
                                        || contains(dto.getCategory(), search)
                                        || contains(dto.getPosition(), search)
                        )
                        .toList();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Question search completed successfully",
                        result
                )
        );
    }


    // =====================================================
    // CATEGORY FILTER
    // =====================================================

    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    getByCategory(String category) {

        List<ScreeningQuestionResponseDto> result =
                questionRepository
                        .findByCategoryIgnoreCase(category)
                        .stream()
                        .map(this::toDto)
                        .toList();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Questions filtered successfully",
                        result
                )
        );
    }


    // =====================================================
    // STATS
    // =====================================================

    public ResponseEntity<ApiResponse<ScreeningQuestionStatsDto>>
    getStats() {

        ScreeningQuestionStatsDto stats =
                new ScreeningQuestionStatsDto(
                        questionRepository.count(),
                        questionRepository.countByActiveTrue(),
                        questionRepository
                                .countByCategoryIgnoreCase("TECHNICAL"),
                        questionRepository
                                .countByCategoryIgnoreCase("BEHAVIORAL")
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Screening question statistics retrieved successfully",
                        stats
                )
        );
    }


    // =====================================================
    // MAPPER
    // =====================================================

    private ScreeningQuestionResponseDto toDto(
            ScreeningQuestion question
    ) {

        ScreeningQuestionResponseDto dto =
                new ScreeningQuestionResponseDto();

        dto.setId(question.getId());
        dto.setQuestion(question.getQuestion());
        dto.setCategory(question.getCategory());
        dto.setJobId(question.getJobId());
        dto.setDifficulty(question.getDifficulty());
        dto.setActive(question.getActive());
        dto.setSource(question.getSource());
        dto.setCreatedAt(question.getCreatedAt());

        if (question.getJobId() != null) {

            Job job = jobRepository
                    .findById(question.getJobId())
                    .orElse(null);

            if (job != null) {
                dto.setPosition(job.getTitle());
            }

        } else {

            dto.setPosition("All Positions");
        }

        return dto;
    }


    private boolean contains(
            String value,
            String search
    ) {

        return value != null &&
                value.toLowerCase().contains(search);
    }
    public ResponseEntity<ApiResponse<List<ScreeningQuestionResponseDto>>>
    saveAIQuestions(SaveAIQuestionsRequestDto request) {

        try {

            // Validate job
            if (request.getJobId() != null &&
                    !jobRepository.existsById(request.getJobId())) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "Job not found",
                                        null
                                )
                        );
            }

            // Validate questions
            if (request.getQuestions() == null ||
                    request.getQuestions().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "At least one question is required",
                                        null
                                )
                        );
            }

            List<ScreeningQuestionResponseDto> savedQuestions =
                    new ArrayList<>();

            for (String questionText : request.getQuestions()) {

                if (questionText == null ||
                        questionText.isBlank()) {
                    continue;
                }

                ScreeningQuestion question =
                        new ScreeningQuestion();

                question.setQuestion(
                        questionText.trim()
                );

                question.setJobId(
                        request.getJobId()
                );

                question.setCategory(
                        request.getCategory()
                );

                question.setDifficulty(
                        request.getDifficulty()
                );

                question.setActive(true);

                // Important
                question.setSource("AI");

                ScreeningQuestion saved =
                        questionRepository.save(question);

                savedQuestions.add(
                        toDto(saved)
                );
            }

            if (savedQuestions.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                new ApiResponse<>(
                                        false,
                                        "No valid questions were provided",
                                        null
                                )
                        );
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "AI-generated questions saved successfully",
                                    savedQuestions
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to save AI-generated questions: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
}