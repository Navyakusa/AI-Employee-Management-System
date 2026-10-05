package com.ems.service;

import com.ems.dto.ChatbotRequestDto;

import com.ems.dto.PythonChatResponseDto;
import com.ems.dto.PythonChatbotRequestDto;
import com.ems.entity.Job;
import com.ems.repository.JobRepository;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
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

    public String getChatbotResponse(ChatbotRequestDto request) {

        if (request == null ||
                request.getMessage() == null ||
                request.getMessage().isBlank()) {

            return "Please enter a message.";
        }

        // ---------------------------------------------------------
        // 1. Determine user role from JWT / Spring Security
        // ---------------------------------------------------------

        String userRole = getCurrentUserRole();

        System.out.println("=================================");
        System.out.println("CHATBOT USER ROLE = " + userRole);
        System.out.println("=================================");

        // ---------------------------------------------------------
        // 2. Build job context
        // ---------------------------------------------------------

        String jobContext = buildJobContext();

        // ---------------------------------------------------------
        // 3. Create Java -> Python request
        // ---------------------------------------------------------

        PythonChatbotRequestDto pythonRequest =
                new PythonChatbotRequestDto();

        pythonRequest.setMessage(request.getMessage());

        pythonRequest.setConversation_history(
                request.getConversation_history()
        );

        pythonRequest.setJob_context(jobContext);

        // IMPORTANT:
        // Role comes from backend security context,
        // NOT from frontend.
        pythonRequest.setRole(userRole);

        // ---------------------------------------------------------
        // 4. Call Python ML service
        // ---------------------------------------------------------

        PythonChatResponseDto response =
                pythonAIClient.chat(pythonRequest);

        // ---------------------------------------------------------
        // 5. Validate Python response
        // ---------------------------------------------------------

        if (response == null ||
                response.getResponse() == null ||
                response.getResponse().isBlank()) {

            return "Sorry, I could not generate a response.";
        }

        return response.getResponse().trim();
    }


    // =========================================================
    // GET CURRENT USER ROLE
    // =========================================================

    private String getCurrentUserRole() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        // No authentication
        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {

            return "PUBLIC";
        }

        // Allowed application roles
        Set<String> allowedRoles = Set.of(
                "CANDIDATE",
                "EMPLOYEE",
                "RECRUITER",
                "HIRING_MANAGER",
                "EMPLOYER",
                "INTERVIEWER",
                "HR",
                "SUPER_ADMIN"
        );

        for (GrantedAuthority authority :
                authentication.getAuthorities()) {

            String authorityName =
                    authority.getAuthority();

            if (authorityName == null) {
                continue;
            }

            // ROLE_HR -> HR
            if (authorityName.startsWith("ROLE_")) {

                String role =
                        authorityName.substring(5)
                                .toUpperCase();

                if (allowedRoles.contains(role)) {
                    return role;
                }
            }

            // Also support authorities without ROLE_ prefix
            String role =
                    authorityName.toUpperCase();

            if (allowedRoles.contains(role)) {
                return role;
            }
        }

        // Authenticated but no recognized application role
        return "PUBLIC";
    }


    // =========================================================
    // BUILD JOB CONTEXT
    // =========================================================

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