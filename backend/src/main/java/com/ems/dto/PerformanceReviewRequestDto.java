
package com.ems.dto;

import java.time.LocalDate;
import java.util.List;

public class PerformanceReviewRequestDto {

    private Long employeeId;
    private String reviewPeriod;
    private LocalDate reviewDate;
    private Double overallScore;
    private String status;
    private String comments;
    private String strengths;
    private String improvementAreas;
    private List<PerformanceSkillDto> skills;

    public PerformanceReviewRequestDto() {
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getReviewPeriod() {
        return reviewPeriod;
    }

    public void setReviewPeriod(String reviewPeriod) {
        this.reviewPeriod = reviewPeriod;
    }

    public LocalDate getReviewDate() {
        return reviewDate;
    }

    public void setReviewDate(LocalDate reviewDate) {
        this.reviewDate = reviewDate;
    }

    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getStrengths() {
        return strengths;
    }

    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }

    public String getImprovementAreas() {
        return improvementAreas;
    }

    public void setImprovementAreas(String improvementAreas) {
        this.improvementAreas = improvementAreas;
    }

    public List<PerformanceSkillDto> getSkills() {
        return skills;
    }

    public void setSkills(List<PerformanceSkillDto> skills) {
        this.skills = skills;
    }
}
