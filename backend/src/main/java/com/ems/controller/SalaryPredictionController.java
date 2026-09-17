package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.SalaryPredictionRequestDto;
import com.ems.dto.SalaryPredictionResponseDto;
import com.ems.service.SalaryPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/salary-prediction")
@CrossOrigin(origins = "http://localhost:5173")
public class SalaryPredictionController {

    private final SalaryPredictionService salaryPredictionService;

    public SalaryPredictionController(
            SalaryPredictionService salaryPredictionService
    ) {
        this.salaryPredictionService =
                salaryPredictionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<ApiResponse<SalaryPredictionResponseDto>>
    predictSalary(
            @RequestBody SalaryPredictionRequestDto request
    ) {

        return salaryPredictionService.predictSalary(request);
    }
}