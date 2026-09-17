package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.PerformanceResponseDto;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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

    public ResponseEntity<ApiResponse<PerformanceSummaryDto>> getMyPerformanceSummary(
            Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Employee profile not found",
                            null
                    ));
        }

        List<PerformanceReview> reviews =
                performanceReviewRepository
                        .findByEmployeeIdOrderByReviewDateDesc(employee.getId());

        if (reviews.isEmpty()) {

            PerformanceSummaryDto summary = new PerformanceSummaryDto();

            summary.setOverallScore(0.0);
            summary.setReviewDate(null);
            summary.setReviewStatus("NOT_REVIEWED");
            summary.setPreviousScore(null);
            summary.setTotalReviews(0);
            summary.setSkills(Collections.emptyList());

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Performance summary retrieved successfully",
                            summary
                    ));
        }

        PerformanceReview currentReview = reviews.get(0);

        Double previousScore = null;

        if (reviews.size() > 1) {
            previousScore = reviews.get(1).getOverallScore();
        }

        List<PerformanceSkillDto> skills =
                getSkills(currentReview.getId());

        PerformanceSummaryDto summary = new PerformanceSummaryDto();

        summary.setOverallScore(currentReview.getOverallScore());
        summary.setReviewDate(currentReview.getReviewDate());
        summary.setReviewStatus(currentReview.getStatus());
        summary.setPreviousScore(previousScore);
        summary.setTotalReviews(reviews.size());
        summary.setSkills(skills);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Performance summary retrieved successfully",
                        summary
                ));
    }

    public ResponseEntity<ApiResponse<List<PerformanceResponseDto>>> getMyPerformance(
            Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Employee profile not found",
                            null
                    ));
        }

        List<PerformanceReview> reviews =
                performanceReviewRepository
                        .findByEmployeeIdOrderByReviewDateDesc(employee.getId());

        List<PerformanceResponseDto> response = new ArrayList<>();

        for (PerformanceReview review : reviews) {
            response.add(convertToDto(review));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Performance history retrieved successfully",
                        response
                ));
    }

    public ResponseEntity<ApiResponse<PerformanceResponseDto>> getMyPerformanceById(
            Long performanceId,
            Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Employee profile not found",
                            null
                    ));
        }

        PerformanceReview review =
                performanceReviewRepository
                        .findByIdAndEmployeeId(
                                performanceId,
                                employee.getId()
                        )
                        .orElse(null);

        if (review == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Performance review not found",
                            null
                    ));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Performance review retrieved successfully",
                        convertToDto(review)
                ));
    }

    private Employee getLoggedInEmployee(Authentication authentication) {

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

        List<PerformanceSkillDto> skills =
                getSkills(review.getId());

        PerformanceResponseDto dto =
                new PerformanceResponseDto();

        dto.setId(review.getId());
        dto.setEmployeeId(review.getEmployeeId());
        dto.setReviewPeriod(review.getReviewPeriod());
        dto.setReviewDate(review.getReviewDate());
        dto.setOverallScore(review.getOverallScore());
        dto.setStatus(review.getStatus());
        dto.setReviewer(review.getReviewer());
        dto.setComments(review.getComments());
        dto.setSkills(skills);

        return dto;
    }

    private List<PerformanceSkillDto> getSkills(
            Long performanceReviewId) {

        List<PerformanceSkillScore> skillScores =
                performanceSkillScoreRepository
                        .findByPerformanceReviewId(performanceReviewId);

        List<PerformanceSkillDto> skills = new ArrayList<>();

        for (PerformanceSkillScore skillScore : skillScores) {

            PerformanceSkillDto dto =
                    new PerformanceSkillDto();

            dto.setId(skillScore.getId());
            dto.setSkillName(skillScore.getSkillName());
            dto.setScore(skillScore.getScore());

            skills.add(dto);
        }

        return skills;
    }
}