
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.PerformanceEmployeeDto;
import com.ems.dto.PerformanceResponseDto;
import com.ems.dto.PerformanceReviewRequestDto;
import com.ems.dto.PerformanceSkillDto;
import com.ems.dto.PerformanceSummaryDto;
import com.ems.entity.Employee;
import com.ems.entity.PerformanceReview;
import com.ems.entity.PerformanceSkillScore;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.PerformanceReviewRepository;
import com.ems.repository.PerformanceSkillScoreRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PerformanceService {

    // Proposed rating scale. Confirm this with the product team.
    private static final double MIN_SCORE = 1.0;
    private static final double MAX_SCORE = 5.0;

    // Keep this list aligned with the agreed review workflow.
    private static final Set<String> ALLOWED_STATUSES =
            Set.of("DRAFT", "SUBMITTED", "COMPLETED");

    private final EmployeeRepository employeeRepository;
    private final PerformanceReviewRepository performanceReviewRepository;
    private final PerformanceSkillScoreRepository performanceSkillScoreRepository;

    public PerformanceService(
            EmployeeRepository employeeRepository,
            PerformanceReviewRepository performanceReviewRepository,
            PerformanceSkillScoreRepository performanceSkillScoreRepository) {

        this.employeeRepository = employeeRepository;
        this.performanceReviewRepository = performanceReviewRepository;
        this.performanceSkillScoreRepository = performanceSkillScoreRepository;
    }

    // =========================================================
    // EMPLOYEE: GET OWN PERFORMANCE SUMMARY
    // =========================================================

    public ResponseEntity<ApiResponse<PerformanceSummaryDto>>
    getMyPerformanceSummary(Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return error(HttpStatus.NOT_FOUND, "Employee profile not found");
        }

        List<PerformanceReview> reviews =
                performanceReviewRepository
                        .findByEmployeeIdOrderByReviewDateDesc(employee.getId());

        PerformanceSummaryDto summary = new PerformanceSummaryDto();

        if (reviews.isEmpty()) {
            summary.setOverallScore(0.0);
            summary.setReviewDate(null);
            summary.setReviewStatus("NOT_REVIEWED");
            summary.setPreviousScore(null);
            summary.setTotalReviews(0);
            summary.setSkills(Collections.emptyList());

            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Performance summary retrieved successfully",
                    summary
            ));
        }

        PerformanceReview currentReview = reviews.get(0);

        Double previousScore = reviews.size() > 1
                ? reviews.get(1).getOverallScore()
                : null;

        summary.setOverallScore(currentReview.getOverallScore());
        summary.setReviewDate(currentReview.getReviewDate());
        summary.setReviewStatus(currentReview.getStatus());
        summary.setPreviousScore(previousScore);
        summary.setTotalReviews(reviews.size());
        summary.setSkills(getSkills(currentReview.getId()));

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Performance summary retrieved successfully",
                summary
        ));
    }

    // =========================================================
    // EMPLOYEE: GET OWN REVIEW HISTORY
    // =========================================================

    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getMyPerformance(Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return error(HttpStatus.NOT_FOUND, "Employee profile not found");
        }

        List<PerformanceResponseDto> response =
                performanceReviewRepository
                        .findByEmployeeIdOrderByReviewDateDesc(employee.getId())
                        .stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Performance history retrieved successfully",
                response
        ));
    }

    // =========================================================
    // EMPLOYEE: GET OWN REVIEW BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getMyPerformanceById(
            Long performanceId,
            Authentication authentication) {

        if (performanceId == null || performanceId <= 0) {
            return error(HttpStatus.BAD_REQUEST, "Invalid performance review ID");
        }

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return error(HttpStatus.NOT_FOUND, "Employee profile not found");
        }

        PerformanceReview review = performanceReviewRepository
                .findByIdAndEmployeeId(performanceId, employee.getId())
                .orElse(null);

        if (review == null) {
            return error(HttpStatus.NOT_FOUND, "Performance review not found");
        }

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Performance review retrieved successfully",
                convertToDto(review)
        ));
    }

    // =========================================================
    // HR: LIST EMPLOYEES AVAILABLE FOR REVIEW
    // =========================================================

    public ResponseEntity<ApiResponse<List<PerformanceEmployeeDto>>>
    getEmployeesForReview() {

        List<PerformanceEmployeeDto> employees =
                employeeRepository.findAll()
                        .stream()
                        .map(employee -> new PerformanceEmployeeDto(
                                employee.getId(),
                                employee.getEmployeeId(),
                                employee.getName(),
                                employee.getEmail(),
                                employee.getDepartment(),
                                employee.getDesignation(),
                                employee.getStatus()
                        ))
                        .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Employees retrieved successfully",
                employees
        ));
    }

    // =========================================================
    // HR: CREATE PERFORMANCE REVIEW
    // =========================================================

    @Transactional
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    createPerformanceReview(
            PerformanceReviewRequestDto request,
            Authentication authentication) {

        if (request == null) {
            return error(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equals(authentication.getName())) {

            return error(HttpStatus.UNAUTHORIZED, "Authenticated reviewer is required");
        }

        // Validate database employee ID.
        if (request.getEmployeeId() == null
                || request.getEmployeeId() <= 0) {

            return error(
                    HttpStatus.BAD_REQUEST,
                    "A valid employee database ID is required"
            );
        }

        // Validate review period.
        if (request.getReviewPeriod() == null
                || request.getReviewPeriod().isBlank()) {

            return error(HttpStatus.BAD_REQUEST, "reviewPeriod is required");
        }

        // Validate overall score.
        if (!isValidScore(request.getOverallScore())) {
            return error(
                    HttpStatus.BAD_REQUEST,
                    "overallScore must be between 1 and 5"
            );
        }

        // Default status when frontend does not send one.
        String status = request.getStatus() == null
                || request.getStatus().isBlank()
                ? "SUBMITTED"
                : request.getStatus().trim().toUpperCase();

        if (!ALLOWED_STATUSES.contains(status)) {
            return error(
                    HttpStatus.BAD_REQUEST,
                    "Invalid status. Allowed values: DRAFT, SUBMITTED, COMPLETED"
            );
        }

        // Validate skills before saving anything.
        if (request.getSkills() != null) {
            for (PerformanceSkillDto skill : request.getSkills()) {

                if (skill == null
                        || skill.getSkillName() == null
                        || skill.getSkillName().isBlank()) {

                    return error(
                            HttpStatus.BAD_REQUEST,
                            "Each skill must have a non-empty skillName"
                    );
                }

                if (!isValidScore(skill.getScore())) {
                    return error(
                            HttpStatus.BAD_REQUEST,
                            "Each skill score must be between 1 and 5"
                    );
                }
            }
        }

        // Use the database primary key, not the employee code.
        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElse(null);

        if (employee == null) {
            return error(HttpStatus.NOT_FOUND, "Employee not found");
        }

        PerformanceReview review = new PerformanceReview();

        review.setEmployeeId(employee.getId());
        review.setReviewPeriod(request.getReviewPeriod().trim());
        review.setReviewDate(
                request.getReviewDate() != null
                        ? request.getReviewDate()
                        : LocalDate.now()
        );
        review.setOverallScore(request.getOverallScore());
        review.setStatus(status);
        review.setReviewer(authentication.getName());
        review.setComments(request.getComments());
        review.setStrengths(request.getStrengths());
        review.setImprovementAreas(request.getImprovementAreas());
        review.setCreatedAt(LocalDateTime.now());

        // Save the review and skill scores in the same transaction.
        PerformanceReview savedReview =
                performanceReviewRepository.save(review);

        if (request.getSkills() != null) {
            for (PerformanceSkillDto skill : request.getSkills()) {

                PerformanceSkillScore skillScore =
                        new PerformanceSkillScore();

                skillScore.setPerformanceReviewId(savedReview.getId());
                skillScore.setSkillName(skill.getSkillName().trim());
                skillScore.setScore(skill.getScore());

                performanceSkillScoreRepository.save(skillScore);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Performance review created successfully",
                        convertToDto(savedReview)
                ));
    }

    // =========================================================
    // HR: GET ALL REVIEWS
    // =========================================================

    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getAllPerformanceReviews() {

        List<PerformanceResponseDto> response =
                performanceReviewRepository
                        .findAllByOrderByReviewDateDesc()
                        .stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Performance reviews retrieved successfully",
                response
        ));
    }

    // =========================================================
    // HR: GET ONE REVIEW
    // =========================================================

    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getPerformanceReviewById(Long performanceId) {

        if (performanceId == null || performanceId <= 0) {
            return error(HttpStatus.BAD_REQUEST, "Invalid performance review ID");
        }

        PerformanceReview review = performanceReviewRepository
                .findById(performanceId)
                .orElse(null);

        if (review == null) {
            return error(HttpStatus.NOT_FOUND, "Performance review not found");
        }

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Performance review retrieved successfully",
                convertToDto(review)
        ));
    }

    // =========================================================
    // VALIDATION HELPERS
    // =========================================================

    private boolean isValidScore(Double score) {
        return score != null
                && Double.isFinite(score)
                && score >= MIN_SCORE
                && score <= MAX_SCORE;
    }

    private <T> ResponseEntity<ApiResponse<T>> error(
            HttpStatus status,
            String message) {

        return ResponseEntity.status(status)
                .body(new ApiResponse<>(false, message, null));
    }

    // =========================================================
    // AUTHENTICATED EMPLOYEE LOOKUP
    // =========================================================

    private Employee getLoggedInEmployee(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication.getName().isBlank()
                || "anonymousUser".equals(authentication.getName())) {

            return null;
        }

        return employeeRepository
                .findByEmailIgnoreCase(authentication.getName().trim())
                .orElse(null);
    }

    // =========================================================
    // CONVERT REVIEW TO RESPONSE DTO
    // =========================================================

    private PerformanceResponseDto convertToDto(
            PerformanceReview review) {

        PerformanceResponseDto dto = new PerformanceResponseDto();

        dto.setId(review.getId());
        dto.setEmployeeId(review.getEmployeeId());
        dto.setReviewPeriod(review.getReviewPeriod());
        dto.setReviewDate(review.getReviewDate());
        dto.setOverallScore(review.getOverallScore());
        dto.setStatus(review.getStatus());
        dto.setReviewer(review.getReviewer());
        dto.setComments(review.getComments());
        dto.setStrengths(review.getStrengths());
        dto.setImprovementAreas(review.getImprovementAreas());
        dto.setSkills(getSkills(review.getId()));

        return dto;
    }

    // =========================================================
    // GET SKILL SCORES FOR A REVIEW
    // =========================================================

    private List<PerformanceSkillDto> getSkills(
            Long performanceReviewId) {

        List<PerformanceSkillScore> skillScores =
                performanceSkillScoreRepository
                        .findByPerformanceReviewId(performanceReviewId);

        List<PerformanceSkillDto> skills = new ArrayList<>();

        for (PerformanceSkillScore skillScore : skillScores) {

            PerformanceSkillDto dto = new PerformanceSkillDto();

            dto.setId(skillScore.getId());
            dto.setSkillName(skillScore.getSkillName());
            dto.setScore(skillScore.getScore());

            skills.add(dto);
        }

        return skills;
    }
}
