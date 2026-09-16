package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.AIResumeScreening;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.mapper.AIResumeScreeningMapper;
import com.ems.repository.AIResumeScreeningRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AIResumeScreeningService {

    @Autowired
    private AIResumeScreeningRepository screeningRepository;

    @Autowired
    private AIResumeScreeningMapper screeningMapper;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private PythonAIClient pythonAIClient;


    // =========================================================
    // AI RESUME SCREENING
    // =========================================================

    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>> screenResume(AIResumeScreeningRequestDto requestDto) {

        try {

            // =================================================
            // 1. GET LATEST RESUME
            // =================================================

            Resume resume = resumeRepository.findFirstByCandidateIdOrderByIdDesc(requestDto.getCandidateId()).orElseThrow(() -> new RuntimeException("Resume not found for candidate ID: " + requestDto.getCandidateId()));


            // =================================================
            // 2. GET JOB
            // =================================================

            Job job = jobRepository.findById(requestDto.getJobId()).orElseThrow(() -> new RuntimeException("Job not found with ID: " + requestDto.getJobId()));


            // =================================================
            // 3. VALIDATE RESUME TEXT
            // =================================================

            String resumeText = resume.getExtractedText();

            if (resumeText == null || resumeText.isBlank()) {

                throw new RuntimeException("Extracted resume text is empty for candidate ID: " + requestDto.getCandidateId());
            }


            // =================================================
            // 4. CREATE PYTHON JOB DTO
            // =================================================

            PythonScreeningJobDto pythonJob = new PythonScreeningJobDto();

            pythonJob.setJob_id("J_" + job.getId());

            pythonJob.setJob_title(safeText(job.getTitle()));

            pythonJob.setSeniority(determineJobSeniority(job.getExperienceMin()));

            /*
             * Your Job entity does not currently appear
             * to have an industry field.
             *
             * We use department as the closest available
             * value for now.
             */
            pythonJob.setIndustry(safeText(job.getDepartment()));

            pythonJob.setMust_have_skills(toPythonSkillFormat(job.getRequiredSkills()));

            pythonJob.setNice_to_have_skills(toPythonSkillFormat(job.getPreferredSkills()));

            pythonJob.setDescription(safeText(job.getDescription()));

            pythonJob.setResponsibilities(safeText(job.getResponsibilities()));

            pythonJob.setRequirements(buildRequirements(job));


            // =================================================
            // 5. CREATE PYTHON SCREENING REQUEST
            // =================================================

            PythonScreeningRequestDto pythonRequest = new PythonScreeningRequestDto();

            pythonRequest.setJob(pythonJob);

            /*
             * IMPORTANT:
             *
             * We send resume_text only.
             *
             * FastAPI ScreeningRequest allows:
             *
             * job + resume
             *
             * OR
             *
             * job + resume_text
             *
             * We are using the second option.
             */
            pythonRequest.setResumeText(resumeText);


            // =================================================
            // 6. CALL PYTHON AI
            // =================================================

            System.out.println("=================================");
            System.out.println("CALLING PYTHON RESUME SCREENING");
            System.out.println("Candidate ID = " + requestDto.getCandidateId());
            System.out.println("Job ID = " + requestDto.getJobId());
            System.out.println("=================================");

            PythonScreeningResponseDto pythonResponse = pythonAIClient.screenResume(pythonRequest);


            if (pythonResponse == null) {

                throw new RuntimeException("Python screening returned null response");
            }


            // =================================================
            // 7. DEBUG PYTHON RESULT
            // =================================================

            System.out.println("=================================");
            System.out.println("PYTHON SCREENING RESULT");
            System.out.println("Job ID = " + pythonResponse.getJob_id());
            System.out.println("Resume ID = " + pythonResponse.getResume_id());
            System.out.println("Resume Profile = " + pythonResponse.getExtracted_resume_profile());
            System.out.println("Job Requirements = " + pythonResponse.getExtracted_job_requirements());
            System.out.println("Screening Dimensions = " + pythonResponse.getScreening_dimensions());
            System.out.println("=================================");


            // =================================================
            // 8. CREATE DATABASE ENTITY
            // =================================================

            AIResumeScreening screening = screeningMapper.toEntity(requestDto);

            screening.setCandidateId(requestDto.getCandidateId());

            screening.setJobId(requestDto.getJobId());


            // =================================================
            // 9. MAP EXTRACTED RESUME PROFILE
            // =================================================

            Map<String, Object> resumeProfile = pythonResponse.getExtracted_resume_profile();

            if (resumeProfile != null) {

                screening.setSkills(objectToString(resumeProfile.get("skills")));

                screening.setExperience(objectToString(resumeProfile.get("experience")));

                screening.setEducation(objectToString(resumeProfile.get("education")));

                screening.setCertifications(objectToString(resumeProfile.get("certifications")));

                screening.setJobTitles(objectToString(resumeProfile.get("job_titles")));

                screening.setCompanies(objectToString(resumeProfile.get("companies")));

                screening.setTechnologies(objectToString(resumeProfile.get("technologies")));

                screening.setProjects(objectToString(resumeProfile.get("projects")));

                screening.setYearsOfExperience(objectToDouble(resumeProfile.get("years_of_experience")));
            }


            // =================================================
            // 10. CALCULATE SCORE FROM PYTHON DIMENSIONS
            // =================================================

            double screeningScore = calculateOverallScore(pythonResponse.getScreening_dimensions());

            screening.setScreeningScore(screeningScore);


            // =================================================
            // 11. RESULT / RECOMMENDATION
            // =================================================

            if (screeningScore >= 70) {

                screening.setScreeningResult("QUALIFIED");

                screening.setRecommendation("Candidate appears suitable for further HR screening.");

            } else if (screeningScore >= 50) {

                screening.setScreeningResult("REVIEW");

                screening.setRecommendation("Candidate requires further manual review.");

            } else {

                screening.setScreeningResult("NOT_QUALIFIED");

                screening.setRecommendation("Candidate does not sufficiently match the job requirements.");
            }


            // =================================================
            // 12. SAVE DATABASE
            // =================================================

            AIResumeScreening savedScreening = screeningRepository.save(screening);


            // =================================================
            // 13. MAP RESPONSE
            // =================================================

            AIResumeScreeningResponseDto responseDto = screeningMapper.toResponseDto(savedScreening);


            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "AI resume screening completed successfully", responseDto));


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to perform AI resume screening: " + e.getMessage(), null));
        }
    }


    // =========================================================
    // GET ALL SCREENINGS
    // =========================================================

    public ResponseEntity<ApiResponse<List<AIResumeScreeningResponseDto>>> getAllScreenings() {

        try {

            List<AIResumeScreeningResponseDto> screenings = screeningRepository.findAll().stream().map(screeningMapper::toResponseDto).toList();

            return ResponseEntity.ok(new ApiResponse<>(true, "AI resume screenings retrieved successfully", screenings));

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to retrieve AI resume screenings: " + e.getMessage(), null));
        }
    }


    // =========================================================
    // GET SCREENING BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>> getScreeningById(Long id) {

        try {

            AIResumeScreening screening = screeningRepository.findById(id).orElseThrow(() -> new RuntimeException("AI resume screening not found with id: " + id));

            return ResponseEntity.ok(new ApiResponse<>(true, "AI resume screening retrieved successfully", screeningMapper.toResponseDto(screening)));

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }


    // =========================================================
    // CALCULATE OVERALL SCREENING SCORE
    // =========================================================

    private double calculateOverallScore(List<Map<String, Object>> dimensions) {

        if (dimensions == null || dimensions.isEmpty()) {

            return 0.0;
        }

        List<Double> scores = new ArrayList<>();

        for (Map<String, Object> dimension : dimensions) {

            Double score = extractDimensionScore(dimension);

            if (score != null) {

                scores.add(score);
            }
        }

        if (scores.isEmpty()) {
            return 0.0;
        }

        double total = scores.stream().mapToDouble(Double::doubleValue).sum();

        double average = total / scores.size();

        return Math.round(average * 100.0) / 100.0;
    }


    // =========================================================
    // EXTRACT SCORE FROM SCREENING DIMENSION
    // =========================================================

    private Double extractDimensionScore(Map<String, Object> dimension) {

        if (dimension == null) {
            return null;
        }

        /*
         * FastAPI ScreeningDimension supports
         * different score fields.
         */

        Object matchPct = dimension.get("match_pct");

        if (matchPct != null) {

            return objectToDouble(matchPct);
        }


        Object similarityPct = dimension.get("similarity_pct");

        if (similarityPct != null) {

            return objectToDouble(similarityPct);
        }


        Object similarityScore = dimension.get("similarity_score");

        if (similarityScore != null) {

            Double score = objectToDouble(similarityScore);

            if (score == null) {
                return null;
            }

            /*
             * If Python returns similarity as
             * 0.0 - 1.0 convert it to percentage.
             */
            if (score >= 0 && score <= 1) {

                return score * 100;
            }

            return score;
        }


        Object match = dimension.get("match");

        if (match instanceof Boolean value) {

            return value ? 100.0 : 0.0;
        }

        return null;
    }


    // =========================================================
    // BUILD REQUIREMENTS
    // =========================================================

    private String buildRequirements(Job job) {

        String requiredSkills = safeText(job.getRequiredSkills());

        String education = safeText(job.getEducation());

        StringBuilder requirements = new StringBuilder();

        if (!requiredSkills.isBlank()) {

            requirements.append("Required skills: ").append(requiredSkills);
        }

        if (!education.isBlank()) {

            if (!requirements.isEmpty()) {
                requirements.append(". ");
            }

            requirements.append("Education: ").append(education);
        }

        return requirements.toString();
    }


    // =========================================================
    // JOB SENIORITY
    // =========================================================

    private String determineJobSeniority(Integer experienceMin) {

        if (experienceMin == null || experienceMin <= 2) {

            return "Junior";
        }

        if (experienceMin <= 5) {

            return "Mid";
        }

        return "Senior";
    }


    // =========================================================
    // CONVERT SKILLS TO PYTHON FORMAT
    // =========================================================

    private String toPythonSkillFormat(String skills) {

        if (skills == null || skills.isBlank()) {

            return "[]";
        }

        String[] values = skills.split("[,;|]");

        StringBuilder builder = new StringBuilder("[");

        for (String value : values) {

            String skill = value.trim();

            if (!skill.isBlank()) {

                if (builder.length() > 1) {
                    builder.append(" ");
                }

                builder.append("'").append(skill).append("'");
            }
        }

        builder.append("]");

        return builder.toString();
    }


    // =========================================================
    // OBJECT -> STRING
    // =========================================================

    private String objectToString(Object value) {

        if (value == null) {
            return "";
        }

        if (value instanceof List<?> list) {

            return list.stream().map(String::valueOf).filter(item -> !item.isBlank()).reduce((a, b) -> a + ", " + b).orElse("");
        }

        return String.valueOf(value);
    }


    // =========================================================
    // OBJECT -> DOUBLE
    // =========================================================

    private Double objectToDouble(Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {

            return number.doubleValue();
        }

        /*
         * Python resume parser can sometimes return
         * years as a list/string instead of a number.
         */
        if (value instanceof List<?> list) {

            for (Object item : list) {

                Double number = extractFirstNumber(String.valueOf(item));

                if (number != null) {
                    return number;
                }
            }

            return 0.0;
        }

        Double number = extractFirstNumber(String.valueOf(value));

        return number == null ? 0.0 : number;
    }


    // =========================================================
    // EXTRACT FIRST NUMBER
    // =========================================================

    private Double extractFirstNumber(String value) {

        if (value == null || value.isBlank()) {

            return null;
        }

        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\d+(?:\\.\\d+)?").matcher(value);

        if (matcher.find()) {

            try {

                return Double.parseDouble(matcher.group());

            } catch (NumberFormatException ignored) {

                return null;
            }
        }

        return null;
    }


    // =========================================================
    // NULL SAFE STRING
    // =========================================================

    private String safeText(String value) {

        return value == null ? "" : value.trim();
    }
}