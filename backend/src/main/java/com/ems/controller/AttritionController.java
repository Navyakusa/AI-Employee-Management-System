
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.AttritionPredictionRequestDto;
import com.ems.dto.AttritionPredictionResponseDto;
import com.ems.service.AttritionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attrition")
@CrossOrigin(origins = "http://localhost:5173")
public class AttritionController {

    private final AttritionService attritionService;

    public AttritionController(
            AttritionService attritionService) {

        this.attritionService = attritionService;
    }

    @PostMapping("/predict")
    public ResponseEntity<ApiResponse<AttritionPredictionResponseDto>>
    predictAttrition(
            @RequestBody AttritionPredictionRequestDto request) {

        return attritionService.predictAttrition(request);
    }
}