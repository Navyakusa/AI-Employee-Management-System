
package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.AttritionPredictionRequestDto;
import com.ems.dto.AttritionPredictionResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class AttritionService {

    private final MlAttritionClient mlAttritionClient;

    public AttritionService(
            MlAttritionClient mlAttritionClient) {

        this.mlAttritionClient = mlAttritionClient;
    }

    public ResponseEntity<ApiResponse<AttritionPredictionResponseDto>>
    predictAttrition(
            AttritionPredictionRequestDto request) {

        try {

            AttritionPredictionResponseDto result =
                    mlAttritionClient.predict(request);

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Attrition prediction generated successfully",
                            result
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to connect to attrition ML service: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }
}