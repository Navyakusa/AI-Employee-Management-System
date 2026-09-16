package com.ems.service;

import com.ems.dto.PythonJobRequestDto;
import com.ems.dto.PythonMatchRequestDto;
import com.ems.dto.PythonMatchResponseDto;
import com.ems.dto.PythonResumeRequestDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class PythonAIClient {

    private final ObjectMapper objectMapper;

    public PythonAIClient() {
        this.objectMapper = new ObjectMapper();
    }

    public PythonMatchResponseDto matchCandidate(
            PythonMatchRequestDto request) {

        try {

            if (request == null) {
                throw new RuntimeException("AI request is null");
            }

            PythonJobRequestDto job = request.getJob();
            PythonResumeRequestDto resume = request.getResume();

            if (job == null) {
                throw new RuntimeException("Job data is null");
            }

            if (resume == null) {
                throw new RuntimeException("Resume data is null");
            }

            // Convert DTO directly into JSON using Jackson
            String jsonBody =
                    objectMapper.writeValueAsString(request);

            System.out.println("=================================");
            System.out.println("CALLING PYTHON AI");
            System.out.println("JSON SENT:");
            System.out.println(jsonBody);
            System.out.println("=================================");

            HttpClient client =
                    HttpClient.newBuilder()
                            .version(HttpClient.Version.HTTP_1_1)
                            .build();

            HttpRequest httpRequest =
                    HttpRequest.newBuilder()
                            .uri(
                                    URI.create(
                                            "http://127.0.0.1:8000/match-score?explain=true"
                                    )
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

            System.out.println(
                    "Content-Length = "
                            + jsonBody.getBytes(
                            StandardCharsets.UTF_8
                    ).length
            );

            HttpResponse<String> response =
                    client.send(
                            httpRequest,
                            HttpResponse.BodyHandlers.ofString(
                                    StandardCharsets.UTF_8
                            )
                    );

            System.out.println(
                    "Python HTTP status = "
                            + response.statusCode()
            );

            System.out.println(
                    "Python response = "
                            + response.body()
            );

            if (response.statusCode() < 200
                    || response.statusCode() >= 300) {

                throw new RuntimeException(
                        "Python AI returned HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

            // Convert Python JSON response into Java DTO
            PythonMatchResponseDto result =
                    objectMapper.readValue(
                            response.body(),
                            PythonMatchResponseDto.class
                    );

            System.out.println("=================================");
            System.out.println("MAPPED AI RESPONSE");
            System.out.println(result);
            System.out.println("=================================");

            return result;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Python AI call failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}