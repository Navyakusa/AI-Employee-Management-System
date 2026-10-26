
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
import java.util.stream.Collectors;

@Service
public class PerformanceService {

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

    // EMPLOYEE: Get own performance summary.
    public ResponseEntity<ApiResponse<PerformanceSummaryDto>>
    getMyPerformanceSummary(Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false, "Employee profile not found", null));
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
                    true, "Performance summary retrieved successfully",
                    summary));
        }

        PerformanceReview currentReview = reviews.get(0);
        Double previousScore = reviews.size() > 1
                ? reviews.get(1).getOverallScore() : null;

        summary.setOverallScore(currentReview.getOverallScore());
        summary.setReviewDate(currentReview.getReviewDate());
        summary.setReviewStatus(currentReview.getStatus());
        summary.setPreviousScore(previousScore);
        summary.setTotalReviews(reviews.size());
        summary.setSkills(getSkills(currentReview.getId()));

        return ResponseEntity.ok(new ApiResponse<>(
                true, "Performance summary retrieved successfully",
                summary));
    }

    // EMPLOYEE: Get own review history.
    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getMyPerformance(Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false, "Employee profile not found", null));
        }

        List<PerformanceResponseDto> response =
                performanceReviewRepository
                        .findByEmployeeIdOrderByReviewDateDesc(employee.getId())
                        .stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(
                true, "Performance history retrieved successfully",
                response));
    }

    // EMPLOYEE: Get one of their own reviews only.
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getMyPerformanceById(
            Long performanceId, Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false, "Employee profile not found", null));
        }

        PerformanceReview review = performanceReviewRepository
                .findByIdAndEmployeeId(performanceId, employee.getId())
                .orElse(null);

        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false, "Performance review not found", null));
        }

        return ResponseEntity.ok(new ApiResponse<>(
                true, "Performance review retrieved successfully",
                convertToDto(review)));
    }

    // HR: List employees available for performance evaluation.
    public ResponseEntity<ApiResponse<List<PerformanceEmployeeDto>>>
    getEmployeesForReview() {

        List<PerformanceEmployeeDto> employees =
                employeeRepository.findAll().stream()
                        .map(employee -> new PerformanceEmployeeDto(
                                employee.getId(),
                                employee.getEmployeeId(),
                                employee.getName(),
                                employee.getEmail(),
                                employee.getDepartment(),
                                employee.getDesignation(),
                                employee.getStatus()))
                        .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(
                true, "Employees retrieved successfully", employees));
    }

    // HR: Create a performance review and its skill ratings.
    @Transactional
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    createPerformanceReview(
            PerformanceReviewRequestDto request,
            Authentication authentication) {

        if (request == null || request.getEmployeeId() == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false, "employeeId is required", null));
        }

        if (request.getOverallScore() == null) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false, "overallScore is required", null));
        }

        if (request.getReviewPeriod() == null
                || request.getReviewPeriod().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false, "reviewPeriod is required", null));
        }

        // Validate skills before saving anything.
        if (request.getSkills() != null) {
            for (PerformanceSkillDto skill : request.getSkills()) {
                if (skill == null
                        || skill.getSkillName() == null
                        || skill.getSkillName().isBlank()
                        || skill.getScore() == null) {
                    return ResponseEntity.badRequest().body(new ApiResponse<>(
                            false,
                            "Each skill requires skillName and score",
                            null));
                }
            }
        }

        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElse(null);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false, "Employee not found", null));
        }

        String reviewer = authentication != null
                ? authentication.getName() : null;

        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(employee.getId());
        review.setReviewPeriod(request.getReviewPeriod().trim());
        review.setReviewDate(request.getReviewDate() != null
                ? request.getReviewDate() : LocalDate.now());
        review.setOverallScore(request.getOverallScore());
        review.setStatus(request.getStatus() == null
                || request.getStatus().isBlank()
                ? "SUBMITTED"
                : request.getStatus().trim().toUpperCase());
        review.setReviewer(reviewer);
        review.setComments(request.getComments());
        review.setStrengths(request.getStrengths());
        review.setImprovementAreas(request.getImprovementAreas());
        review.setCreatedAt(LocalDateTime.now());

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
                        true, "Performance review created successfully",
                        convertToDto(savedReview)));
    }

    // HR: View reviews across all employees.
    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>>
    getAllPerformanceReviews() {

        List<PerformanceResponseDto> response =
                performanceReviewRepository
                        .findAllByOrderByReviewDateDesc()
                        .stream()
                        .map(this::convertToDto)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(
                true, "Performance reviews retrieved successfully",
                response));
    }

    // HR: View one review by ID.
    public ResponseEntity<ApiResponse<PerformanceResponseDto>>
    getPerformanceReviewById(Long performanceId) {

        PerformanceReview review = performanceReviewRepository
                .findById(performanceId)
                .orElse(null);

        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false, "Performance review not found", null));
        }

        return ResponseEntity.ok(new ApiResponse<>(
                true, "Performance review retrieved successfully",
                convertToDto(review)));
    }

    private Employee getLoggedInEmployee(
            Authentication authentication) {

        if (authentication == null) {
            return null;
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            return null;
        }

        return employeeRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);
    }

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
