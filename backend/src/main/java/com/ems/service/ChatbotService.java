package com.ems.service;

import com.ems.dto.ChatbotRequestDto;
import com.ems.dto.PythonChatResponseDto;
import com.ems.dto.PythonChatbotRequestDto;

import com.ems.entity.Application;
import com.ems.entity.Candidate;
import com.ems.entity.Interview;
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

import java.util.List;
import java.util.Set;

@Service
public class ChatbotService {

    private final PythonAIClient pythonAIClient;

    private final JobRepository jobRepository;

    private final ApplicationRepository applicationRepository;

    private final CandidateRepository candidateRepository;

    private final InterviewRepository interviewRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ChatbotService(
            PythonAIClient pythonAIClient,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            CandidateRepository candidateRepository,
            InterviewRepository interviewRepository
    ) {

        this.pythonAIClient = pythonAIClient;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.candidateRepository = candidateRepository;
        this.interviewRepository = interviewRepository;
    }


    // =========================================================
    // CHATBOT
    // =========================================================

    public String getChatbotResponse(
            ChatbotRequestDto request
    ) {

        if (request == null ||
                request.getMessage() == null ||
                request.getMessage().isBlank()) {

            return "Please enter a message.";
        }


        // Get role from JWT / Spring Security
        String userRole = getCurrentUserRole();


        System.out.println("=================================");
        System.out.println("CHATBOT USER ROLE = " + userRole);
        System.out.println("=================================");


        // Build context
        String jobContext =
                buildJobContext(userRole);


        // Create Java -> Python request
        PythonChatbotRequestDto pythonRequest =
                new PythonChatbotRequestDto();


        pythonRequest.setMessage(
                request.getMessage()
        );


        pythonRequest.setConversation_history(
                request.getConversation_history()
        );


        pythonRequest.setJob_context(
                jobContext
        );


        // Role comes from JWT
        pythonRequest.setRole(
                userRole
        );


        // Call Python AI service
        PythonChatResponseDto response =
                pythonAIClient.chat(
                        pythonRequest
                );


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


        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication instanceof AnonymousAuthenticationToken) {

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

            String authorityName =
                    authority.getAuthority();


            if (authorityName == null) {
                continue;
            }


            // ROLE_RECRUITER -> RECRUITER
            if (authorityName.startsWith("ROLE_")) {

                String role =
                        authorityName
                                .substring(5)
                                .toUpperCase();


                if (allowedRoles.contains(role)) {
                    return role;
                }
            }


            // Also support RECRUITER without ROLE_
            String role =
                    authorityName.toUpperCase();


            if (allowedRoles.contains(role)) {
                return role;
            }
        }


        return "PUBLIC";
    }


    // =========================================================
    // BUILD CHATBOT CONTEXT
    // =========================================================

    private String buildJobContext(
            String userRole
    ) {

        StringBuilder context =
                new StringBuilder();


        // =====================================================
        // JOB INFORMATION
        // =====================================================

        context.append(
                "===== JOB INFORMATION =====\n"
        );


        List<Job> openJobs =
                jobRepository
                        .findAll()
                        .stream()
                        .filter(job ->
                                job.getStatus() != null &&
                                        job.getStatus()
                                                .equalsIgnoreCase("OPEN")
                        )
                        .limit(30)
                        .toList();


        if (openJobs.isEmpty()) {

            context.append(
                    "There are currently no open jobs available.\n"
            );

        } else {

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

                context.append(
                        "----------------------\n"
                );
            }
        }


        // =====================================================
        // RECRUITER / HR DATA
        // =====================================================

        if ("RECRUITER".equalsIgnoreCase(userRole) ||
                "HIRING_MANAGER".equalsIgnoreCase(userRole) ||
                "EMPLOYER".equalsIgnoreCase(userRole) ||
                "HR".equalsIgnoreCase(userRole) ||
                "SUPER_ADMIN".equalsIgnoreCase(userRole)) {


            // =================================================
            // APPLICATION DATA
            // =================================================

            context.append(
                    "\n\n===== APPLICATION AND CANDIDATE DATA =====\n"
            );


            List<Application> applications =
                    applicationRepository.findAll();


            if (applications.isEmpty()) {

                context.append(
                        "No applications are currently available.\n"
                );

            } else {

                int shortlistedCount = 0;


                for (Application application :
                        applications) {


                    // Get candidate
                    Candidate candidate =
                            candidateRepository
                                    .findById(
                                            application.getCandidateId()
                                    )
                                    .orElse(null);


                    // Get job
                    Job job =
                            jobRepository
                                    .findById(
                                            application.getJobId()
                                    )
                                    .orElse(null);


                    context.append("\n");


                    context.append("Application ID: ")
                            .append(
                                    application.getApplicationId()
                            )
                            .append("\n");


                    context.append("Candidate ID: ")
                            .append(
                                    application.getCandidateId()
                            )
                            .append("\n");


                    // Candidate
                    if (candidate != null) {

                        context.append("Candidate Name: ")
                                .append(candidate.getName())
                                .append("\n");

                        context.append("Candidate Email: ")
                                .append(candidate.getEmail())
                                .append("\n");

                    } else {

                        context.append(
                                "Candidate Name: Unknown\n"
                        );
                    }


                    // Job
                    if (job != null) {

                        context.append("Job ID: ")
                                .append(job.getId())
                                .append("\n");

                        context.append("Job Title: ")
                                .append(job.getTitle())
                                .append("\n");

                    } else {

                        context.append(
                                "Job Title: Unknown\n"
                        );
                    }


                    // Application status
                    context.append("Application Status: ")
                            .append(
                                    application.getStatus()
                            )
                            .append("\n");


                    // Count shortlisted
                    if (application.getStatus() != null &&
                            application.getStatus()
                                    .toString()
                                    .equalsIgnoreCase(
                                            "SHORTLISTED"
                                    )) {

                        shortlistedCount++;
                    }


                    context.append(
                            "----------------------\n"
                    );
                }


                context.append(
                                "\nTOTAL SHORTLISTED APPLICATIONS: "
                        )
                        .append(shortlistedCount)
                        .append("\n");
            }


            // =================================================
            // INTERVIEW DATA
            // =================================================

            context.append(
                    "\n\n===== INTERVIEW DATA =====\n"
            );


            List<Interview> interviews =
                    interviewRepository.findAll();


            if (interviews.isEmpty()) {

                context.append(
                        "No interviews are currently available.\n"
                );

            } else {

                int activeInterviewCount = 0;


                for (Interview interview :
                        interviews) {


                    // Get candidate
                    Candidate candidate =
                            candidateRepository
                                    .findById(
                                            interview.getCandidateId()
                                    )
                                    .orElse(null);


                    // Get job
                    Job job =
                            jobRepository
                                    .findById(
                                            interview.getJobId()
                                    )
                                    .orElse(null);


                    context.append("\n");


                    context.append("Interview ID: ")
                            .append(
                                    interview.getInterviewId()
                            )
                            .append("\n");


                    context.append("Application ID: ")
                            .append(
                                    interview.getApplicationId()
                            )
                            .append("\n");


                    context.append("Candidate ID: ")
                            .append(
                                    interview.getCandidateId()
                            )
                            .append("\n");


                    // Candidate information
                    if (candidate != null) {

                        context.append("Candidate Name: ")
                                .append(candidate.getName())
                                .append("\n");

                        context.append("Candidate Email: ")
                                .append(candidate.getEmail())
                                .append("\n");
                    }


                    // Job information
                    if (job != null) {

                        context.append("Job ID: ")
                                .append(job.getId())
                                .append("\n");

                        context.append("Job Title: ")
                                .append(job.getTitle())
                                .append("\n");
                    }


                    // Interview status
                    context.append("Interview Status: ")
                            .append(
                                    interview.getStatus()
                            )
                            .append("\n");


                    // Interview date
                    context.append("Interview Date & Time: ")
                            .append(
                                    interview.getInterviewDateTime()
                            )
                            .append("\n");


                    // SCHEDULED / RESCHEDULED
                    // are considered active interview stage
                    if (interview.getStatus() != null) {

                        String status =
                                interview.getStatus()
                                        .toString();


                        if (status.equalsIgnoreCase("SCHEDULED") ||
                                status.equalsIgnoreCase("RESCHEDULED")) {

                            activeInterviewCount++;
                        }
                    }


                    context.append(
                            "----------------------\n"
                    );
                }


                context.append(
                                "\nTOTAL ACTIVE INTERVIEWS: "
                        )
                        .append(activeInterviewCount)
                        .append("\n");
            }
        }


        // =====================================================
        // AI INSTRUCTIONS
        // =====================================================

        context.append(
                "\n\n===== CHATBOT INSTRUCTIONS =====\n"
        );


        context.append(
                "Use the application, candidate, job and interview "
                        + "data above to answer recruiter questions.\n"
        );


        context.append(
                "Do not invent candidate names, counts, job data "
                        + "or interview data.\n"
        );


        context.append(
                "If the requested information is not available "
                        + "in the context, say that it is not available.\n"
        );


        return context.toString();
    }
}