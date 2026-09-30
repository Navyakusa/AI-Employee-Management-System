package com.ems.service;

import com.ems.entity.Job;
import com.ems.repository.JobRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final JobRepository jobRepository;

    @Value("${groq.api-key:}")
    private String groqApiKey;

    @Value("${groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    private final RestClient restClient;

    public ChatbotService(JobRepository jobRepository) {

        this.jobRepository = jobRepository;

        this.restClient = RestClient.builder()
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
    }

    public String getChatbotResponse(String userMessage) {

        if (groqApiKey == null || groqApiKey.isBlank()) {
            return "AI chatbot is not configured yet. Please contact the administrator.";
        }

        String jobContext = buildJobContext();

        String systemPrompt = """
                You are TalentAI, the AI assistant for an AI Recruitment
                and Employee Management Platform.

                Your job is to help users with:

                - Available jobs
                - Job descriptions
                - Job applications
                - Resume submission
                - Recruitment process
                - AI resume screening
                - Candidate matching
                - Interviews
                - Employee management
                - General questions about this platform

                IMPORTANT RULES:

                1. Be helpful and professional.
                2. Keep answers concise and easy to understand.
                3. Do not invent job openings or recruitment information.
                4. Use the available job information provided below.
                5. If information is not available, clearly say that you
                   don't have that information.
                6. Never expose internal database information.
                7. Never expose API keys, passwords or system configuration.
                8. If the user asks about something unrelated to the
                   recruitment platform, politely explain that you are
                   designed primarily for recruitment and employee-management
                   questions.

                CURRENT JOB INFORMATION:

                %s
                """.formatted(jobContext);

        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", systemPrompt
                        ),
                        Map.of(
                                "role", "user",
                                "content", userMessage
                        )
                ),
                "temperature", 0.3,
                "max_tokens", 500
        );

        try {

            Map response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(
                            "Authorization",
                            "Bearer " + groqApiKey
                    )
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                return "Sorry, I could not generate a response.";
            }

            List choices =
                    (List) response.get("choices");

            if (choices == null || choices.isEmpty()) {
                return "Sorry, I could not generate a response.";
            }

            Map firstChoice =
                    (Map) choices.get(0);

            Map message =
                    (Map) firstChoice.get("message");

            if (message == null) {
                return "Sorry, I could not generate a response.";
            }

            Object content =
                    message.get("content");

            if (content == null) {
                return "Sorry, I could not generate a response.";
            }

            return content.toString();

        } catch (Exception e) {

            e.printStackTrace();

            return "Sorry, I'm having trouble connecting to the AI service right now.";
        }
    }

    private String buildJobContext() {

        List<Job> jobs = jobRepository.findAll();

        List<Job> openJobs = jobs.stream()
                .filter(job ->
                        job.getStatus() != null &&
                        job.getStatus().equalsIgnoreCase("OPEN")
                )
                .limit(30)
                .collect(Collectors.toList());

        if (openJobs.isEmpty()) {
            return "There are currently no open jobs available.";
        }

        StringBuilder context = new StringBuilder();

        for (Job job : openJobs) {

            context.append("\n");

            context.append("Job ID: ")
                    .append(job.getId())
                    .append("\n");

            context.append("Title: ")
                    .append(job.getTitle())
                    .append("\n");

            context.append("Department: ")
                    .append(job.getDepartment())
                    .append("\n");

            context.append("Location: ")
                    .append(job.getLocation())
                    .append("\n");

            context.append("Employment Type: ")
                    .append(job.getEmploymentType())
                    .append("\n");

            context.append("Experience: ")
                    .append(job.getExperienceMin())
                    .append(" - ")
                    .append(job.getExperienceMax())
                    .append(" years\n");

            context.append("Required Skills: ")
                    .append(job.getRequiredSkills())
                    .append("\n");

            context.append("Education: ")
                    .append(job.getEducation())
                    .append("\n");

            context.append("Description: ")
                    .append(job.getDescription())
                    .append("\n");

            context.append("----------------------\n");
        }

        return context.toString();
    }
}