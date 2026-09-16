package com.ems.service;

import com.ems.dto.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class PythonAIClient {

    private static final String AI_BASE_URL = "http://127.0.0.1:8000";

    private final HttpClient httpClient;

    private final ObjectMapper objectMapper;

    public PythonAIClient() {

        this.objectMapper = new ObjectMapper();

        this.httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).connectTimeout(Duration.ofSeconds(10)).build();
    }

    public PythonMatchResponseDto matchCandidate(PythonMatchRequestDto request) {

        try {

            if (request == null) {
                throw new RuntimeException("Python match request is null");
            }

            if (request.getJob() == null) {
                throw new RuntimeException("Job data is null");
            }

            if (request.getResume() == null) {
                throw new RuntimeException("Resume data is null");
            }

            String jsonBody = objectMapper.writeValueAsString(request);

            System.out.println("=================================");
            System.out.println("CALLING PYTHON AI - MATCH SCORE");
            System.out.println("JSON SENT TO PYTHON:");
            System.out.println(jsonBody);
            System.out.println("=================================");

            HttpResponse<String> response = sendPostRequest(AI_BASE_URL + "/match-score?explain=true", jsonBody);

            System.out.println("PYTHON MATCH STATUS = " + response.statusCode());

            System.out.println("PYTHON MATCH RESPONSE = " + response.body());

            validateResponse(response, "Candidate Matching");

            return objectMapper.readValue(response.body(), PythonMatchResponseDto.class);

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException("Python AI call failed: " + e.getMessage(), e);
        }
    }

    public PythonSkillGapResponseDto analyzeSkillGap(PythonSkillGapRequestDto request) {

        try {

            if (request == null) {
                throw new RuntimeException("Python skill gap request is null");
            }

            if (request.getJob() == null) {
                throw new RuntimeException("Job data is null");
            }

            if (request.getResume() == null) {
                throw new RuntimeException("Resume data is null");
            }

            String jsonBody = objectMapper.writeValueAsString(request);

            byte[] bodyBytes = jsonBody.getBytes(StandardCharsets.UTF_8);

            System.out.println("=================================");
            System.out.println("CALLING PYTHON AI - SKILL GAP");
            System.out.println("URL = " + AI_BASE_URL + "/skill-gap");
            System.out.println("BODY LENGTH = " + bodyBytes.length);
            System.out.println("JSON SENT TO PYTHON:");
            System.out.println(jsonBody);
            System.out.println("=================================");

            HttpRequest httpRequest = HttpRequest.newBuilder().uri(URI.create(AI_BASE_URL + "/skill-gap")).version(HttpClient.Version.HTTP_1_1).timeout(Duration.ofSeconds(30)).header("Content-Type", "application/json; charset=UTF-8").header("Accept", "application/json").POST(HttpRequest.BodyPublishers.ofByteArray(bodyBytes)).build();

            System.out.println("HTTP METHOD = " + httpRequest.method());

            System.out.println("HTTP HEADERS = " + httpRequest.headers());

            System.out.println("BODY PUBLISHER PRESENT = " + httpRequest.bodyPublisher().isPresent());

            if (httpRequest.bodyPublisher().isPresent()) {

                System.out.println("CONTENT LENGTH = " + httpRequest.bodyPublisher().get().contentLength());
            }

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            System.out.println("=================================");
            System.out.println("PYTHON SKILL GAP STATUS = " + response.statusCode());
            System.out.println("PYTHON SKILL GAP RESPONSE = " + response.body());
            System.out.println("=================================");

            validateResponse(response, "Skill Gap");

            PythonSkillGapResponseDto result = objectMapper.readValue(response.body(), PythonSkillGapResponseDto.class);

            System.out.println("PARSED PYTHON RESPONSE:");
            System.out.println("Job ID = " + result.getJobId());
            System.out.println("Resume ID = " + result.getResumeId());
            System.out.println("Must Have Coverage = " + result.getMustHaveCoveragePct());
            System.out.println("Nice To Have Coverage = " + result.getNiceToHaveCoveragePct());
            System.out.println("Missing Must Have = " + result.getMissingMustHave());
            System.out.println("Missing Nice To Have = " + result.getMissingNiceToHave());

            return result;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException("Python Skill Gap call failed: " + e.getMessage(), e);
        }
    }
// =========================================================
// 3. AI RESUME SCREENING
// FastAPI: POST /screen-resume
// =========================================================

    public PythonScreeningResponseDto screenResume(
            PythonScreeningRequestDto request) {

        try {

            if (request == null) {
                throw new RuntimeException(
                        "Python screening request is null"
                );
            }

            if (request.getJob() == null) {
                throw new RuntimeException(
                        "Screening job data is null"
                );
            }

            if (request.getResume() == null
                    && (request.getResumeText() == null
                    || request.getResumeText().isBlank())) {

                throw new RuntimeException(
                        "Resume data and resume text are both empty"
                );
            }

            String jsonBody =
                    objectMapper.writeValueAsString(request);

            System.out.println("=================================");
            System.out.println(
                    "CALLING PYTHON AI - RESUME SCREENING"
            );
            System.out.println(
                    "URL = " + AI_BASE_URL + "/screen-resume"
            );
            System.out.println("JSON SENT TO PYTHON:");
            System.out.println(jsonBody);
            System.out.println("=================================");

            HttpResponse<String> response =
                    sendPostRequest(
                            AI_BASE_URL + "/screen-resume",
                            jsonBody
                    );

            System.out.println(
                    "PYTHON SCREENING STATUS = "
                            + response.statusCode()
            );

            System.out.println(
                    "PYTHON SCREENING RESPONSE = "
                            + response.body()
            );

            validateResponse(
                    response,
                    "Resume Screening"
            );

            return objectMapper.readValue(
                    response.body(),
                    PythonScreeningResponseDto.class
            );

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Python Resume Screening call failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
    private HttpResponse<String> sendPostRequest(String url, String jsonBody) throws Exception {

        byte[] bodyBytes = jsonBody.getBytes(StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).version(HttpClient.Version.HTTP_1_1).timeout(Duration.ofSeconds(30)).header("Content-Type", "application/json; charset=UTF-8").header("Accept", "application/json").POST(HttpRequest.BodyPublishers.ofByteArray(bodyBytes)).build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private void validateResponse(HttpResponse<String> response, String moduleName) {

        if (response.statusCode() < 200 || response.statusCode() >= 300) {

            throw new RuntimeException("Python " + moduleName + " returned HTTP " + response.statusCode() + ": " + response.body());
        }
    }

}