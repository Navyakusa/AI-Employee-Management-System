
package com.ems.service;

import com.ems.dto.ChatbotJobDto;
import com.ems.dto.ChatbotRequestDto;
import com.ems.dto.PythonChatResponseDto;
import com.ems.dto.PythonChatbotRequestDto;
import com.ems.entity.Job;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ChatbotService {

    private final PythonAIClient pythonAIClient;
    private final JobRepository jobRepository;

    // Retained in the constructor for compatibility with existing wiring.
    // They are intentionally NOT used to build chatbot context.
    public ChatbotService(
            PythonAIClient pythonAIClient,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            InterviewRepository interviewRepository) {

        this.pythonAIClient = pythonAIClient;
        this.jobRepository = jobRepository;
    }

    public String getChatbotResponse(ChatbotRequestDto request) {

        if (request == null
                || request.getMessage() == null
                || request.getMessage().isBlank()) {
            return "Please enter a message.";
        }

        String userRole = getCurrentUserRole();

        // Only open jobs whose closing date has not passed.
        List<ChatbotJobDto> jobs = getAvailableJobs();

        PythonChatbotRequestDto pythonRequest =
                new PythonChatbotRequestDto();

        pythonRequest.setMessage(request.getMessage().trim());
        pythonRequest.setRole(userRole);

        pythonRequest.setConversation_history(
                request.getConversation_history() == null
                        ? new ArrayList<>()
                        : request.getConversation_history()
        );

        pythonRequest.setJobs(jobs);

        // Keep the legacy field available in the DTO, but do not send
        // the old text context containing recruiter/candidate data.
        pythonRequest.setJob_context(null);

        // Log metadata only. Do not log messages or private data.
        System.out.println("========== CHATBOT REQUEST ==========");
        System.out.println("Role: " + userRole);
        System.out.println("Available jobs: " + jobs.size());
        System.out.println(
                "Conversation history entries: "
                        + pythonRequest.getConversation_history().size()
        );
        System.out.println("Sending structured jobs array to Python.");
        System.out.println("=====================================");

        PythonChatResponseDto response =
                pythonAIClient.chat(pythonRequest);

        if (response == null
                || response.getResponse() == null
                || response.getResponse().isBlank()) {
            return "Sorry, I could not generate a response.";
        }

        return response.getResponse().trim();
    }

    private List<ChatbotJobDto> getAvailableJobs() {

        LocalDateTime now = LocalDateTime.now();

        return jobRepository.findAll()
                .stream()
                .filter(job -> job != null)
                .filter(job -> job.getStatus() != null
                        && "OPEN".equalsIgnoreCase(
                        job.getStatus().trim()))
                .filter(job -> job.getClosingDate() == null
                        || !job.getClosingDate().isBefore(now))
                .limit(30)
                .map(this::toChatbotJobDto)
                .toList();
    }

    private ChatbotJobDto toChatbotJobDto(Job job) {

        ChatbotJobDto dto = new ChatbotJobDto();

        dto.setJobId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDepartment(job.getDepartment());
        dto.setLocation(job.getLocation());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setExperienceMin(job.getExperienceMin());
        dto.setExperienceMax(job.getExperienceMax());
        dto.setRequiredSkills(job.getRequiredSkills());
        dto.setPreferredSkills(job.getPreferredSkills());
        dto.setEducation(job.getEducation());
        dto.setDescription(job.getDescription());
        dto.setResponsibilities(job.getResponsibilities());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setOpenings(job.getOpenings());
        dto.setClosingDate(job.getClosingDate());

        return dto;
    }

    private String getCurrentUserRole() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken
                || "anonymousUser".equals(authentication.getName())) {
            return "PUBLIC";
        }

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

            String authorityName = authority.getAuthority();

            if (authorityName == null) {
                continue;
            }

            String role = authorityName.toUpperCase();

            if (role.startsWith("ROLE_")) {
                role = role.substring(5);
            }

            if (allowedRoles.contains(role)) {
                return role;
            }
        }

        return "PUBLIC";
    }
}
