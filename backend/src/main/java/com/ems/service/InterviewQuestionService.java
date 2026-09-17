package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InterviewQuestionService {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final PythonAIClient pythonAIClient;

    public ResponseEntity<ApiResponse<InterviewQuestionResponseDto>>
    generateQuestions(InterviewQuestionRequestDto request) {

        try {

            // 1. Get job
            Job job = jobRepository.findById(request.getJobId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Job not found with ID: "
                                            + request.getJobId()
                            )
                    );

            // 2. Get latest resume for candidate
            Resume resume = resumeRepository
                    .findFirstByCandidateIdOrderByIdDesc(
                            request.getCandidateId()
                    )
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Resume not found for candidate ID: "
                                            + request.getCandidateId()
                            )
                    );

            // 3. Build Python Job DTO
            PythonRankingJobDto pythonJob =
                    new PythonRankingJobDto();

            pythonJob.setJobId(
                    "J_" + job.getId()
            );

            pythonJob.setJobTitle(
                    safe(job.getTitle())
            );

            pythonJob.setSeniority(
                    buildSeniority(job)
            );

            pythonJob.setIndustry(
                    safe(job.getDepartment())
            );

            pythonJob.setMustHaveSkills(
                    formatSkillsForPython(
                            job.getRequiredSkills()
                    )
            );

            pythonJob.setNiceToHaveSkills(
                    formatSkillsForPython(
                            job.getPreferredSkills()
                    )
            );

            pythonJob.setDescription(
                    safe(job.getDescription())
            );

            pythonJob.setResponsibilities(
                    safe(job.getResponsibilities())
            );

            pythonJob.setRequirements(
                    buildRequirements(job)
            );

            // 4. Build Python Resume DTO
            PythonRankingCandidateDto pythonResume =
                    new PythonRankingCandidateDto();

            pythonResume.setResumeId(
                    "R_" + resume.getId()
            );

            pythonResume.setRole("");

            pythonResume.setSeniority("");

            pythonResume.setIndustry("");

            pythonResume.setYearsExperience(
                    extractYearsExperience(
                            resume.getExtractedExperience()
                    )
            );

            pythonResume.setEducation(
                    safe(resume.getExtractedEducation())
            );

            pythonResume.setSkills(
                    formatSkillsForPython(
                            resume.getExtractedSkills()
                    )
            );

            pythonResume.setSummary(
                    safe(resume.getExtractedText())
            );

            pythonResume.setExperienceBullets(
                    safe(resume.getExtractedExperience())
            );

            // 5. Build Python request
            PythonInterviewQuestionRequestDto pythonRequest =
                    new PythonInterviewQuestionRequestDto();

            pythonRequest.setJob(pythonJob);
            pythonRequest.setResume(pythonResume);

            pythonRequest.setNumQuestions(
                    request.getNumQuestions() == null
                            ? 5
                            : request.getNumQuestions()
            );

            pythonRequest.setProvider("anthropic");

            // 6. Call Python AI
            PythonInterviewQuestionResponseDto aiResponse =
                    pythonAIClient.generateInterviewQuestions(
                            pythonRequest
                    );

            // 7. Build EMS response
            InterviewQuestionResponseDto responseDto =
                    new InterviewQuestionResponseDto();

            responseDto.setJobId(job.getId());
            responseDto.setCandidateId(
                    request.getCandidateId()
            );
            responseDto.setSource(
                    aiResponse.getSource()
            );
            responseDto.setQuestions(
                    aiResponse.getQuestions()
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Interview questions generated successfully",
                            responseDto
                    )
            );

        } catch (Exception e) {

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body(
                    new ApiResponse<>(
                            false,
                            "Failed to generate interview questions: "
                                    + e.getMessage(),
                            null
                    )
            );
        }
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private String formatSkillsForPython(String skills) {

        if (skills == null || skills.isBlank()) {
            return "[]";
        }

        if (skills.trim().startsWith("[")
                && skills.contains("'")) {
            return skills;
        }

        String[] skillArray = skills.split(",");

        StringBuilder result =
                new StringBuilder("[");

        for (String skill : skillArray) {

            String cleaned = skill.trim();

            if (cleaned.isEmpty()) {
                continue;
            }

            if (result.length() > 1) {
                result.append(" ");
            }

            result.append("'")
                    .append(cleaned.replace("'", ""))
                    .append("'");
        }

        result.append("]");

        return result.toString();
    }

    private String buildSeniority(Job job) {

        if (job.getExperienceMin() == null) {
            return "";
        }

        if (job.getExperienceMin() >= 5) {
            return "Senior";
        }

        if (job.getExperienceMin() >= 2) {
            return "Mid";
        }

        return "Junior";
    }

    private String buildRequirements(Job job) {

        StringBuilder requirements =
                new StringBuilder();

        if (job.getRequiredSkills() != null) {
            requirements.append("Required skills: ")
                    .append(job.getRequiredSkills());
        }

        if (job.getEducation() != null) {
            requirements.append(". Education: ")
                    .append(job.getEducation());
        }

        if (job.getExperienceMin() != null) {
            requirements.append(". Minimum experience: ")
                    .append(job.getExperienceMin())
                    .append(" years");
        }

        return requirements.toString();
    }

    private double extractYearsExperience(String experience) {

        if (experience == null || experience.isBlank()) {
            return 0.0;
        }

        java.util.regex.Matcher matcher =
                java.util.regex.Pattern
                        .compile("(\\d+(?:\\.\\d+)?)")
                        .matcher(experience);

        if (matcher.find()) {
            try {
                return Double.parseDouble(
                        matcher.group(1)
                );
            } catch (NumberFormatException ignored) {
            }
        }

        return 0.0;
    }
}