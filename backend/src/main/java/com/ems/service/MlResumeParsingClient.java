package com.ems.service;

import com.ems.dto.ResumeParseRequestDto;
import com.ems.dto.ResumeParseResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class MlResumeParsingClient {

    private final ObjectMapper objectMapper;
    private final String mlServiceBaseUrl;
    private final HttpClient httpClient;

    public MlResumeParsingClient(
            @Value("${ml.service.base-url}") String mlServiceBaseUrl
    ) {

        // Create ObjectMapper directly
        this.objectMapper = new ObjectMapper();

        this.mlServiceBaseUrl = mlServiceBaseUrl;

        this.httpClient =
                HttpClient.newBuilder()
                        .version(HttpClient.Version.HTTP_1_1)
                        .connectTimeout(Duration.ofSeconds(10))
                        .build();
    }

    // =========================================================
    // PARSE RESUME
    // =========================================================

    public ResumeParseResponseDto parseResume(
            String resumeText
    ) {

        try {

            if (resumeText == null
                    || resumeText.isBlank()) {

                throw new RuntimeException(
                        "Resume text is empty"
                );
            }

            // =================================================
            // Create request DTO
            // =================================================

            ResumeParseRequestDto requestDto =
                    new ResumeParseRequestDto(
                            resumeText
                    );

            // =================================================
            // Convert DTO → JSON
            // =================================================

            String jsonBody =
                    objectMapper.writeValueAsString(
                            requestDto
                    );

            // =================================================
            // Python API URL
            // =================================================

            String url =
                    mlServiceBaseUrl
                            + "/parse-resume";

            // =================================================
            // HTTP Request
            // =================================================

            HttpRequest httpRequest =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(url)
                            )
                            .timeout(
                                    Duration.ofSeconds(30)
                            )
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .header(
                                    "Accept",
                                    "application/json"
                            )
                            .POST(
                                    HttpRequest.BodyPublishers.ofString(
                                            jsonBody,
                                            StandardCharsets.UTF_8
                                    )
                            )
                            .build();

            // =================================================
            // Call Python ML service
            // =================================================

            HttpResponse<String> response =
                    httpClient.send(
                            httpRequest,
                            HttpResponse.BodyHandlers.ofString(
                                    StandardCharsets.UTF_8
                            )
                    );

            System.out.println(
                    "Python Resume Parser HTTP status = "
                            + response.statusCode()
            );

            // =================================================
            // Check response
            // =================================================

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Python Resume Parser returned HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

            // =================================================
            // JSON → Response DTO
            // =================================================

            ResumeParseResponseDto result =
                    objectMapper.readValue(
                            response.body(),
                            ResumeParseResponseDto.class
                    );

            return result;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Python resume parsing call failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}