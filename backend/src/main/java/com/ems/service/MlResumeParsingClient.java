package com.ems.service;

import com.ems.dto.ResumeParseResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class MlResumeParsingClient {

    private final ObjectMapper objectMapper;

    public MlResumeParsingClient() {
        this.objectMapper = new ObjectMapper();
    }

    public ResumeParseResponseDto parseResume(String resumeText) {

        try {

            if (resumeText == null) {
                throw new RuntimeException("Resume text is null");
            }

            if (resumeText.isBlank()) {
                throw new RuntimeException("Resume text is empty");
            }

            // Create request body
            ResumeParseRequestBody requestBody =
                    new ResumeParseRequestBody(resumeText);

            // Convert request body into JSON
            String jsonBody =
                    objectMapper.writeValueAsString(requestBody);

            System.out.println("=================================");
            System.out.println("CALLING PYTHON RESUME PARSER");
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
                                            "http://127.0.0.1:8000/parse-resume"
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
                        "Python Resume Parser returned HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

            // Convert Python JSON response into Java DTO
            ResumeParseResponseDto result =
                    objectMapper.readValue(
                            response.body(),
                            ResumeParseResponseDto.class
                    );

            System.out.println("=================================");
            System.out.println("MAPPED RESUME PARSE RESPONSE");
            System.out.println(result);
            System.out.println("=================================");

            return result;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Python resume parsing call failed: "
                            + e.getMessage(),
                    e
            );
        }
    }

    private record ResumeParseRequestBody(
            String resume_text
    ) {
    }
}