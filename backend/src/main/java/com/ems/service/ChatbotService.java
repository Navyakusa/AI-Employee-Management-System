package com.ems.service;

import com.ems.dto.ChatbotRequestDto;
import com.ems.dto.PythonChatResponseDto;
import com.ems.entity.Job;
import com.ems.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatbotService {

    private final PythonAIClient pythonAIClient;
    private final JobRepository jobRepository;

    public ChatbotService(
            PythonAIClient pythonAIClient,
            JobRepository jobRepository
    ) {
        this.pythonAIClient = pythonAIClient;
        this.jobRepository = jobRepository;
    }

    public String getChatbotResponse(
            ChatbotRequestDto request
    ) {

        if (request == null ||
                request.getMessage() == null ||
                request.getMessage().isBlank()) {

            return "Please enter a message.";
        }

        /*
         * =========================================================
         * BUILD CURRENT OPEN JOB CONTEXT
         * =========================================================
         */
        String jobContext = buildJobContext();

        /*
         * =========================================================
         * CREATE REQUEST FOR PYTHON
         * =========================================================
         */
        ChatbotRequestDto pythonRequest = new ChatbotRequestDto();

        pythonRequest.setMessage(
                request.getMessage()
        );

        pythonRequest.setConversation_history(
                request.getConversation_history()
        );

        pythonRequest.setJob_context(
                jobContext
        );

        /*
         * =========================================================
         * CALL PYTHON CHATBOT
         * =========================================================
         */
        PythonChatResponseDto response =
                pythonAIClient.chat(pythonRequest);

        if (response == null ||
                response.getResponse() == null ||
                response.getResponse().isBlank()) {

            return "Sorry, I could not generate a response.";
        }

        return response.getResponse().trim();
    }


    /*
     * =============================================================
     * BUILD JOB CONTEXT
     * =============================================================
     */
    private String buildJobContext() {

        List<Job> openJobs =
                jobRepository.findAll()
                        .stream()
                        .filter(job ->
                                job.getStatus() != null &&
                                        job.getStatus()
                                                .equalsIgnoreCase("OPEN")
                        )
                        .limit(30)
                        .collect(Collectors.toList());

        if (openJobs.isEmpty()) {
            return "There are currently no open jobs available.";
        }

        StringBuilder context =
                new StringBuilder();

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