package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.SalaryPredictionRequestDto;
import com.ems.dto.SalaryPredictionResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class SalaryPredictionService {

    private final PythonAIClient pythonAIClient;

    public SalaryPredictionService(
            PythonAIClient pythonAIClient
    ) {
        this.pythonAIClient = pythonAIClient;
    }

    public ResponseEntity<ApiResponse<SalaryPredictionResponseDto>>
    predictSalary(SalaryPredictionRequestDto request) {

        try {

            SalaryPredictionResponseDto prediction =
                    pythonAIClient.predictSalary(request);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Salary predicted successfully using AI",
                            prediction
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to predict salary: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
}