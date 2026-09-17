package com.ems.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttritionPredictionRequestDto {

    @JsonProperty("Age")
    private Integer age;

    @JsonProperty("BusinessTravel")
    private String businessTravel;

    @JsonProperty("DailyRate")
    private Integer dailyRate;

    @JsonProperty("Department")
    private String department;

    @JsonProperty("DistanceFromHome")
    private Integer distanceFromHome;

    @JsonProperty("Education")
    private Integer education;

    @JsonProperty("EducationField")
    private String educationField;

    @JsonProperty("EnvironmentSatisfaction")
    private Integer environmentSatisfaction;

    @JsonProperty("Gender")
    private String gender;

    @JsonProperty("HourlyRate")
    private Integer hourlyRate;

    @JsonProperty("JobInvolvement")
    private Integer jobInvolvement;

    @JsonProperty("JobLevel")
    private Integer jobLevel;

    @JsonProperty("JobRole")
    private String jobRole;

    @JsonProperty("JobSatisfaction")
    private Integer jobSatisfaction;

    @JsonProperty("MaritalStatus")
    private String maritalStatus;

    @JsonProperty("MonthlyIncome")
    private Integer monthlyIncome;

    @JsonProperty("MonthlyRate")
    private Integer monthlyRate;

    @JsonProperty("NumCompaniesWorked")
    private Integer numCompaniesWorked;

    @JsonProperty("OverTime")
    private String overTime;

    @JsonProperty("PercentSalaryHike")
    private Integer percentSalaryHike;

    @JsonProperty("PerformanceRating")
    private Integer performanceRating;

    @JsonProperty("RelationshipSatisfaction")
    private Integer relationshipSatisfaction;

    @JsonProperty("StockOptionLevel")
    private Integer stockOptionLevel;

    @JsonProperty("TotalWorkingYears")
    private Integer totalWorkingYears;

    @JsonProperty("TrainingTimesLastYear")
    private Integer trainingTimesLastYear;

    @JsonProperty("WorkLifeBalance")
    private Integer workLifeBalance;

    @JsonProperty("YearsAtCompany")
    private Integer yearsAtCompany;

    @JsonProperty("YearsInCurrentRole")
    private Integer yearsInCurrentRole;

    @JsonProperty("YearsSinceLastPromotion")
    private Integer yearsSinceLastPromotion;

    @JsonProperty("YearsWithCurrManager")
    private Integer yearsWithCurrManager;
}