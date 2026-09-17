package com.ems.service;

import com.ems.dto.AttritionPredictionRequestDto;
import com.ems.dto.AttritionPredictionResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MlAttritionClient {

    private final RestTemplate restTemplate;

    private final String mlBaseUrl;

    public MlAttritionClient(
            @Value("${ml.service.base-url}") String mlBaseUrl) {

        this.mlBaseUrl = mlBaseUrl;
        this.restTemplate = new RestTemplate();
    }

    public AttritionPredictionResponseDto predict(
            AttritionPredictionRequestDto request) {

        String url =
                mlBaseUrl + "/predict-attrition";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );

        HttpEntity<AttritionPredictionRequestDto> entity =
                new HttpEntity<>(
                        request,
                        headers
                );

        ResponseEntity<AttritionPredictionResponseDto> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        AttritionPredictionResponseDto.class
                );

        return response.getBody();
    }
}