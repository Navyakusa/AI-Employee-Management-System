package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.common.ApplicationStatus;
import com.ems.dto.*;
import com.ems.entity.AIResumeScreening;
import com.ems.entity.Application;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.mapper.AIResumeScreeningMapper;
import com.ems.repository.AIResumeScreeningRepository;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import com.ems.entity.Candidate;
import com.ems.entity.User;
import com.ems.repository.UserRepository;

@Service
public class AIResumeScreeningService {

    @Autowired
    private CandidateRepository candidateRepository;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;
    @Autowired
    private AIResumeScreeningRepository screeningRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

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

    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>>
    screenResume(AIResumeScreeningRequestDto requestDto) {

        try {

            // =====================================================
            // 1. VALIDATE REQUEST
            // =====================================================

            if (requestDto == null) {
                throw new RuntimeException(
                        "Screening request cannot be null"
                );
            }

            if (requestDto.getCandidateId() == null) {
                throw new RuntimeException(
                        "Candidate ID is required"
                );
            }

            if (requestDto.getJobId() == null) {
                throw new RuntimeException(
                        "Job ID is required"
                );
            }


            // =====================================================
            // 2. GET AND VALIDATE THE EXACT RESUME
            // =====================================================

            if (requestDto.getResumeId() == null) {
                throw new RuntimeException(
                        "Resume ID is required. Select the exact resume before screening."
                );
            }

            Resume resume = resumeRepository
                    .findById(requestDto.getResumeId())
                    .orElseThrow(() -> new RuntimeException(
                            "Resume not found: " + requestDto.getResumeId()
                    ));

            if (!resume.getCandidateId().equals(requestDto.getCandidateId())) {
                throw new RuntimeException(
                        "The selected resume does not belong to this candidate."
                );
            }

            if (requestDto.getApplicationId() != null) {
                Application requestedApplication = applicationRepository
                        .findById(requestDto.getApplicationId())
                        .orElseThrow(() -> new RuntimeException(
                                "Application not found: " + requestDto.getApplicationId()
                        ));

                if (!requestedApplication.getCandidateId().equals(requestDto.getCandidateId())
                        || !requestedApplication.getJobId().equals(requestDto.getJobId())) {
                    throw new RuntimeException(
                            "Application does not match the requested candidate and job."
                    );
                }

                // A candidate may reuse the same resume for multiple job applications.
                // The request is validated against the exact candidate + job application;
                // do not reject the resume merely because its optional applicationId
                // points to another application for the same candidate.
            }


            // =====================================================
            // 3. GET JOB
            // =====================================================

            Job job =
                    jobRepository
                            .findById(requestDto.getJobId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Job not found with ID: "
                                                    + requestDto.getJobId()
                                    )
                            );


            // =====================================================
            // 4. GET RESUME TEXT
            // =====================================================

            String resumeText =
                    safeText(resume.getExtractedText());

            if (resumeText.isBlank()) {

                throw new RuntimeException(
                        "Extracted resume text is empty for candidate ID: "
                                + requestDto.getCandidateId()
                );
            }


            // =====================================================
            // 5. DEBUG RESUME DATA
            // =====================================================

            System.out.println("=================================");
            System.out.println("AI RESUME SCREENING");
            System.out.println("Candidate ID       = "
                    + requestDto.getCandidateId());
            System.out.println("Job ID             = "
                    + requestDto.getJobId());
            System.out.println("Resume ID          = "
                    + resume.getId());
            System.out.println("Resume File        = "
                    + resume.getFileName());
            System.out.println("Extracted Skills   = "
                    + resume.getExtractedSkills());
            System.out.println("Extracted Experience = "
                    + resume.getExtractedExperience());
            System.out.println("Extracted Education  = "
                    + resume.getExtractedEducation());
            System.out.println("Resume Text Length  = "
                    + resumeText.length());
            System.out.println("=================================");


            // =====================================================
            // 6. BUILD PYTHON JOB
            // =====================================================

            PythonScreeningJobDto pythonJob =
                    new PythonScreeningJobDto();

            pythonJob.setJob_id(
                    "J_" + job.getId()
            );

            pythonJob.setJob_title(
                    safeText(job.getTitle())
            );

            pythonJob.setSeniority(
                    determineJobSeniority(
                            job.getExperienceMin()
                    )
            );

            pythonJob.setIndustry(
                    safeText(job.getDepartment())
            );

            pythonJob.setMust_have_skills(
                    toPythonSkillFormat(
                            job.getRequiredSkills()
                    )
            );

            pythonJob.setNice_to_have_skills(
                    toPythonSkillFormat(
                            job.getPreferredSkills()
                    )
            );

            pythonJob.setDescription(
                    safeText(job.getDescription())
            );

            pythonJob.setResponsibilities(
                    safeText(job.getResponsibilities())
            );

            pythonJob.setRequirements(
                    buildRequirements(job)
            );


            // =====================================================
            // 7. BUILD PYTHON REQUEST
            // =====================================================

            PythonScreeningRequestDto pythonRequest =
                    new PythonScreeningRequestDto();

            pythonRequest.setJob(pythonJob);

            pythonRequest.setResumeText(
                    resumeText
            );


            // =====================================================
            // 8. DEBUG PYTHON REQUEST
            // =====================================================

            System.out.println("=================================");
            System.out.println("PYTHON SCREENING REQUEST");
            System.out.println("Job ID              = "
                    + pythonJob.getJob_id());
            System.out.println("Job Title           = "
                    + pythonJob.getJob_title());
            System.out.println("Seniority           = "
                    + pythonJob.getSeniority());
            System.out.println("Industry            = "
                    + pythonJob.getIndustry());
            System.out.println("Must Have Skills    = "
                    + pythonJob.getMust_have_skills());
            System.out.println("Nice To Have Skills = "
                    + pythonJob.getNice_to_have_skills());
            System.out.println("Requirements        = "
                    + pythonJob.getRequirements());
            System.out.println("Resume Text Length  = "
                    + resumeText.length());
            System.out.println("=================================");


            // =====================================================
            // 9. CALL PYTHON
            // =====================================================

            System.out.println("========== SCREENING REQUEST TRACE ==========");
            System.out.println("Source request candidateId = " + requestDto.getCandidateId());
            System.out.println("Source request jobId       = " + requestDto.getJobId());
            System.out.println("Selected resume ID         = " + resume.getId());
            System.out.println("Selected resume filename   = " + resume.getFileName());
            System.out.println("Selected resume text length= " + resumeText.length());
            System.out.println("Selected resume text start = "
                    + resumeText.substring(0, Math.min(250, resumeText.length())));
            System.out.println("Python request job ID      = " + pythonJob.getJob_id());
            System.out.println("==============================================");

            PythonScreeningResponseDto pythonResponse =
                    pythonAIClient.screenResume(
                            pythonRequest
                    );

            if (pythonResponse == null) {

                throw new RuntimeException(
                        "Python screening returned null response"
                );
            }


            // =====================================================
            // 10. DEBUG PYTHON RESPONSE
            // =====================================================

            System.out.println("=================================");
            System.out.println("PYTHON SCREENING RESPONSE");

            System.out.println(
                    "Job ID = "
                            + pythonResponse.getJob_id()
            );

            System.out.println(
                    "Resume ID = "
                            + pythonResponse.getResume_id()
            );

            System.out.println(
                    "Extracted Resume Profile = "
                            + pythonResponse
                            .getExtracted_resume_profile()
            );

            System.out.println(
                    "Extracted Job Requirements = "
                            + pythonResponse
                            .getExtracted_job_requirements()
            );

            System.out.println(
                    "Screening Dimensions = "
                            + pythonResponse
                            .getScreening_dimensions()
            );

            System.out.println("=================================");


            // =====================================================
            // 11. CREATE SCREENING ENTITY
            // =====================================================

            AIResumeScreening screening =
                    screeningMapper.toEntity(requestDto);

            screening.setCandidateId(
                    requestDto.getCandidateId()
            );

            screening.setJobId(
                    requestDto.getJobId()
            );


            // =====================================================
            // 12. MAP PYTHON RESUME PROFILE
            // =====================================================

            Map<String, Object> resumeProfile =
                    pythonResponse
                            .getExtracted_resume_profile();

            System.out.println("========== PYTHON PROFILE TRACE ==========");
            System.out.println("Python response job ID    = " + pythonResponse.getJob_id());
            System.out.println("Python response resume ID = " + pythonResponse.getResume_id());
            System.out.println("Python profile is null    = " + (resumeProfile == null));
            if (resumeProfile != null) {
                System.out.println("Python profile keys       = " + resumeProfile.keySet());
                System.out.println("Python profile skills     = " + resumeProfile.get("skills"));
                System.out.println("Python profile skills_cleaned = "
                        + resumeProfile.get("skills_cleaned"));
            }
            System.out.println("==========================================");

            if (resumeProfile != null) {
                System.out.println("=================================");
                System.out.println("PYTHON RESUME PROFILE");
                System.out.println("Skills Cleaned = "
                        + resumeProfile.get("skills_cleaned"));
                System.out.println("Skills = "
                        + resumeProfile.get("skills"));
                System.out.println("=================================");

                Object pythonSkills = resumeProfile.get("skills");

                System.out.println("=================================");
                System.out.println("FINAL PYTHON SKILLS");
                System.out.println("extracted_resume_profile.skills = " + pythonSkills);
                System.out.println("=================================");

                screening.setSkills(
                        objectToString(pythonSkills)
                );

                System.out.println("=================================");
                System.out.println("AIResumeScreening.skills BEFORE SAVE");
                System.out.println(screening.getSkills());
                System.out.println("=================================");

                screening.setExperience(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "experience",
                                        "experiences",
                                        "work_experience",
                                        "extracted_experience"
                                )
                        )
                );

                screening.setEducation(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "education",
                                        "educations",
                                        "extracted_education"
                                )
                        )
                );

                screening.setCertifications(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "certifications",
                                        "certificates"
                                )
                        )
                );

                screening.setJobTitles(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "job_titles",
                                        "job_title"
                                )
                        )
                );

                screening.setCompanies(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "companies",
                                        "company"
                                )
                        )
                );

                screening.setTechnologies(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "technologies",
                                        "technology"
                                )
                        )
                );

                screening.setProjects(
                        objectToString(
                                firstPresent(
                                        resumeProfile,
                                        "projects",
                                        "project"
                                )
                        )
                );


                // =================================================
                // YEARS OF EXPERIENCE
                // =================================================

                Object years =
                        firstPresent(
                                resumeProfile,
                                "years_of_experience",
                                "yearsOfExperience",
                                "experience_years",
                                "total_experience",
                                "years_experience"
                        );

                Double yearsOfExperience =
                        objectToDouble(years);

                screening.setYearsOfExperience(
                        yearsOfExperience
                );

                System.out.println(
                        "Extracted Years Of Experience = "
                                + yearsOfExperience
                );
            }


            // =====================================================
            // 13. CALCULATE SCREENING SCORE
            // =====================================================

            double screeningScore =
                    calculateOverallScore(
                            pythonResponse
                                    .getScreening_dimensions()
                    );

            screening.setScreeningScore(
                    screeningScore
            );


            System.out.println(
                    "FINAL SCREENING SCORE = "
                            + screeningScore
            );


            // =====================================================
            // 14. SCREENING RESULT
            // =====================================================

            // Prefer the Python service's explicit Overall Match result when present.
            // If it is missing, apply the agreed Python threshold (40%).
            String pythonMatchResult = extractOverallResult(
                    pythonResponse.getScreening_dimensions()
            );

            if (pythonMatchResult != null) {
                if (pythonMatchResult.equalsIgnoreCase("Match")
                        || pythonMatchResult.equalsIgnoreCase("QUALIFIED")) {
                    screening.setScreeningResult("QUALIFIED");
                    screening.setRecommendation(
                            "Candidate meets the AI screening match threshold and is suitable for further HR screening."
                    );
                } else if (pythonMatchResult.equalsIgnoreCase("No Match")
                        || pythonMatchResult.equalsIgnoreCase("NOT_MATCH")
                        || pythonMatchResult.equalsIgnoreCase("NOT_QUALIFIED")) {
                    screening.setScreeningResult("NOT_QUALIFIED");
                    screening.setRecommendation(
                            "Candidate does not meet the AI screening match threshold."
                    );
                } else {
                    // Unknown result value: use the agreed numeric threshold.
                    setResultFromScore(screeningScore, screening);
                }
            } else {
                setResultFromScore(screeningScore, screening);
            }


            // =====================================================
            // 15. SCREENED TIME
            // =====================================================

            screening.setScreenedAt(
                    LocalDateTime.now()
            );


            // =====================================================
            // 16. SAVE
            // =====================================================


            AIResumeScreening savedScreening =
                    screeningRepository.saveAndFlush(screening);

            // Update the matching application only when it is still APPLIED.
            // Preserve later workflow states such as SHORTLISTED, ACCEPTED, or REJECTED.
            Application application = null;

            if (requestDto.getApplicationId() != null) {
                application = applicationRepository
                        .findById(requestDto.getApplicationId())
                        .orElse(null);
            }

            if (application != null
                    && application.getStatus() == ApplicationStatus.APPLIED) {

                application.setStatus(ApplicationStatus.AI_SCREENED);
                applicationRepository.save(application);

                System.out.println(
                        "Application " + application.getApplicationId()
                                + " status updated to AI_SCREENED");

            } else if (application == null) {

                System.out.println(
                        "No application found for candidate "
                                + requestDto.getCandidateId()
                                + " and job " + requestDto.getJobId());

            } else {

                System.out.println(
                        "Application status preserved: "
                                + application.getStatus());
            }

            System.out.println("===== SAVED SCREENING VERIFICATION =====");
            System.out.println("Saved Screening ID: " + savedScreening.getId());
            System.out.println("Saved Candidate ID: " + savedScreening.getCandidateId());
            System.out.println("Saved Job ID: " + savedScreening.getJobId());
            System.out.println("Saved Skills: " + savedScreening.getSkills());
            System.out.println("========================================");

            Candidate candidate =
                    candidateRepository
                            .findById(requestDto.getCandidateId())
                            .orElse(null);

            if (candidate != null &&
                    candidate.getEmail() != null) {

                User candidateUser =
                        userRepository
                                .findByEmailIgnoreCase(
                                        candidate.getEmail()
                                )
                                .orElse(null);

                if (candidateUser != null) {

                    notificationService.createNotification(
                            candidateUser.getUserId(),
                            "Your AI resume screening has been completed for "
                                    + job.getTitle(),
                            "RESUME_SCREENING_COMPLETED"
                    );
                }
            }


            // =====================================================
            // 17. RESPONSE
            // =====================================================

            AIResumeScreeningResponseDto responseDto =
                    screeningMapper.toResponseDto(
                            savedScreening
                    );

            System.out.println("========== FINAL RESPONSE TRACE ==========");
            System.out.println("Saved screening ID         = " + savedScreening.getId());
            System.out.println("Saved screening skills     = " + savedScreening.getSkills());
            System.out.println("DTO screening ID           = " + responseDto.getId());
            System.out.println("DTO screening skills       = " + responseDto.getSkills());
            System.out.println("==========================================");

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            new ApiResponse<>(
                                    true,
                                    "AI resume screening completed successfully",
                                    responseDto
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to perform AI resume screening: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // SCORE CALCULATION
    // =========================================================

    private double calculateOverallScore(
            List<Map<String, Object>> dimensions) {

        if (dimensions == null || dimensions.isEmpty()) {
            System.out.println(
                    "WARNING: Python returned no screening dimensions"
            );
            return 0.0;
        }

        // Fix: use the Python service's final overall score when supplied.
        // This avoids averaging individual dimensions into a different score.
        for (Map<String, Object> dimension : dimensions) {
            if (dimension == null) {
                continue;
            }

            Object overallValue = firstPresent(
                    dimension,
                    "overall_match_pct",
                    "overallMatchPct",
                    "overall_match_percentage",
                    "overallMatchPercentage"
            );

            Double overallScore = objectToDouble(overallValue);
            if (overallScore != null) {
                double normalized = normalizeScore(overallScore);
                System.out.println(
                        "Using Python overall_match_pct = " + normalized
                );
                return Math.round(normalized * 100.0) / 100.0;
            }
        }

        // Fallback for older Python responses that do not contain an overall score.
        List<Double> scores = new ArrayList<>();
        for (Map<String, Object> dimension : dimensions) {
            Double score = extractDimensionScore(dimension);
            if (score != null) {
                scores.add(normalizeScore(score));
            }
        }

        if (scores.isEmpty()) {
            System.out.println(
                    "WARNING: No usable screening scores found"
            );
            return 0.0;
        }

        double total = scores.stream()
                .mapToDouble(Double::doubleValue)
                .sum();
        double average = total / scores.size();
        return Math.round(average * 100.0) / 100.0;
    }

    /**
     * Extract the explicit result from Python's Overall Match dimension.
     * Returns null when the response has no recognized result field.
     */
    private String extractOverallResult(
            List<Map<String, Object>> dimensions) {

        if (dimensions == null) {
            return null;
        }

        for (Map<String, Object> dimension : dimensions) {
            if (dimension == null) {
                continue;
            }

            Object result = firstPresent(
                    dimension,
                    "result",
                    "overall_match_result",
                    "overallMatchResult"
            );

            if (result != null) {
                String value = String.valueOf(result).trim();
                if (!value.isEmpty()) {
                    System.out.println(
                            "Python overall match result = " + value
                    );
                    return value;
                }
            }
        }

        return null;
    }

    /** Apply the Python service's documented 40% match threshold as fallback. */
    private void setResultFromScore(
            double screeningScore,
            AIResumeScreening screening) {

        if (screeningScore >= 40.0) {
            screening.setScreeningResult("QUALIFIED");
            screening.setRecommendation(
                    "Candidate meets the AI screening match threshold and is suitable for further HR screening."
            );
        } else {
            screening.setScreeningResult("NOT_QUALIFIED");
            screening.setRecommendation(
                    "Candidate does not meet the AI screening match threshold."
            );
        }
    }


    // =========================================================
    // EXTRACT DIMENSION SCORE
    // =========================================================

    private Double extractDimensionScore(
            Map<String, Object> dimension) {

        if (dimension == null) {
            return null;
        }


        Object matchPct =
                firstPresent(
                        dimension,
                        "overall_match_pct",
                        "overallMatchPct",
                        "overall_match_percentage",
                        "overallMatchPercentage",
                        "match_pct",
                        "match_percentage",
                        "matchPercent",
                        "score"
                );

        if (matchPct != null) {

            return objectToDouble(
                    matchPct
            );
        }


        Object similarityPct =
                firstPresent(
                        dimension,
                        "similarity_pct",
                        "similarity_percentage",
                        "similarityPercent"
                );

        if (similarityPct != null) {

            return objectToDouble(
                    similarityPct
            );
        }


        Object similarityScore =
                firstPresent(
                        dimension,
                        "similarity_score",
                        "similarity",
                        "score_value"
                );

        if (similarityScore != null) {

            Double score =
                    objectToDouble(
                            similarityScore
                    );

            if (score == null) {
                return null;
            }

            return normalizeScore(score);
        }


        Object match =
                firstPresent(
                        dimension,
                        "match",
                        "matched"
                );

        if (match instanceof Boolean value) {

            return value
                    ? 100.0
                    : 0.0;
        }

        return null;
    }


    // =========================================================
    // NORMALIZE SCORE
    // =========================================================

    private double normalizeScore(
            Double score) {

        if (score == null) {
            return 0.0;
        }

        if (score >= 0 &&
                score <= 1) {

            return score * 100.0;
        }

        if (score < 0) {
            return 0.0;
        }

        if (score > 100) {
            return 100.0;
        }

        return score;
    }


    // =========================================================
    // FIND FIRST PRESENT VALUE
    // =========================================================

    private Object firstPresent(
            Map<String, Object> map,
            String... keys) {

        if (map == null) {
            return null;
        }

        for (String key : keys) {

            if (map.containsKey(key) &&
                    map.get(key) != null) {

                return map.get(key);
            }
        }

        return null;
    }


    // =========================================================
    // BUILD REQUIREMENTS
    // =========================================================

    private String buildRequirements(Job job) {

        String requiredSkills =
                safeText(
                        job.getRequiredSkills()
                );

        String education =
                safeText(
                        job.getEducation()
                );

        StringBuilder requirements =
                new StringBuilder();

        if (!requiredSkills.isBlank()) {

            requirements.append(
                    "Required skills: "
            );

            requirements.append(
                    requiredSkills
            );
        }

        if (!education.isBlank()) {

            if (!requirements.isEmpty()) {
                requirements.append(". ");
            }

            requirements.append(
                    "Education: "
            );

            requirements.append(
                    education
            );
        }

        return requirements.toString();
    }


    // =========================================================
    // JOB SENIORITY
    // =========================================================

    private String determineJobSeniority(
            Integer experienceMin) {

        if (experienceMin == null ||
                experienceMin <= 2) {

            return "Junior";
        }

        if (experienceMin <= 5) {

            return "Mid";
        }

        return "Senior";
    }


    // =========================================================
    // PYTHON SKILL FORMAT
    // =========================================================

    private String toPythonSkillFormat(
            String skills) {

        if (skills == null ||
                skills.isBlank()) {

            return "[]";
        }

        String[] values =
                skills.split("[,;|]");

        StringBuilder builder =
                new StringBuilder("[");

        boolean first = true;

        for (String value : values) {

            String skill =
                    value.trim();

            if (skill.isBlank()) {
                continue;
            }

            if (!first) {
                builder.append(", ");
            }

            builder.append("'")
                    .append(
                            skill.replace(
                                    "'",
                                    "\\'"
                            )
                    )
                    .append("'");

            first = false;
        }

        builder.append("]");

        return builder.toString();
    }


    // =========================================================
    // OBJECT -> STRING
    // =========================================================

    private String objectToString(
            Object value) {

        if (value == null) {
            return "";
        }

        if (value instanceof List<?> list) {

            return list.stream()
                    .map(String::valueOf)
                    .filter(
                            item ->
                                    !item.isBlank()
                    )
                    .reduce(
                            (a, b) ->
                                    a + ", " + b
                    )
                    .orElse("");
        }

        return String.valueOf(value);
    }


    // =========================================================
    // OBJECT -> DOUBLE
    // =========================================================

    private Double objectToDouble(
            Object value) {

        if (value == null) {
            return null;
        }

        if (value instanceof Number number) {

            return number.doubleValue();
        }

        if (value instanceof List<?> list) {

            for (Object item : list) {

                Double number =
                        extractFirstNumber(
                                String.valueOf(item)
                        );

                if (number != null) {
                    return number;
                }
            }

            return null;
        }

        return extractFirstNumber(
                String.valueOf(value)
        );
    }


    // =========================================================
    // EXTRACT FIRST NUMBER
    // =========================================================

    private Double extractFirstNumber(
            String value) {

        if (value == null ||
                value.isBlank()) {

            return null;
        }

        java.util.regex.Matcher matcher =
                java.util.regex.Pattern
                        .compile(
                                "\\d+(?:\\.\\d+)?"
                        )
                        .matcher(value);

        if (matcher.find()) {

            try {

                return Double.parseDouble(
                        matcher.group()
                );

            } catch (NumberFormatException ignored) {

                return null;
            }
        }

        return null;
    }


    // =========================================================
    // NULL SAFE STRING
    // =========================================================

    private String safeText(
            String value) {

        return value == null
                ? ""
                : value.trim();
    }


    // =========================================================
    // GET ALL SCREENINGS
    // =========================================================

    public ResponseEntity<ApiResponse<List<AIResumeScreeningResponseDto>>>
    getAllScreenings() {

        try {

            List<AIResumeScreeningResponseDto> screenings =
                    screeningRepository
                            .findAll()
                            .stream()
                            .map(
                                    screeningMapper::toResponseDto
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI resume screenings retrieved successfully",
                            screenings
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve AI resume screenings: "
                                            + e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // GET SCREENING BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>>
    getScreeningById(Long id) {

        try {

            AIResumeScreening screening =
                    screeningRepository
                            .findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "AI resume screening not found with id: "
                                                    + id
                                    )
                            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI resume screening retrieved successfully",
                            screeningMapper.toResponseDto(
                                    screening
                            )
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // MANAGEMENT
    // =========================================================

    public ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
    getScreeningManagementData() {

        try {

            List<AIResumeScreening> allScreenings =
                    screeningRepository.findAll();

            // Keep only the latest screening for each Candidate + Job.
            // Older screening records remain in the database as history.
            Map<String, AIResumeScreening> latestScreenings =
                    new java.util.HashMap<>();

            for (AIResumeScreening screening : allScreenings) {

                String key =
                        screening.getCandidateId()
                                + "_"
                                + screening.getJobId();

                AIResumeScreening existing =
                        latestScreenings.get(key);

                if (existing == null) {
                    latestScreenings.put(key, screening);
                    continue;
                }

                LocalDateTime existingTime =
                        existing.getScreenedAt();

                LocalDateTime currentTime =
                        screening.getScreenedAt();

                boolean currentIsLatest = false;

                if (existingTime == null && currentTime != null) {
                    currentIsLatest = true;
                } else if (existingTime != null && currentTime != null) {
                    currentIsLatest = currentTime.isAfter(existingTime);

                    // If times are identical, use the higher ID.
                    if (!currentIsLatest &&
                            currentTime.equals(existingTime)) {
                        currentIsLatest =
                                screening.getId() > existing.getId();
                    }
                }

                if (currentIsLatest) {
                    latestScreenings.put(key, screening);
                }
            }

            List<AIScreeningManagementDto> result =
                    new ArrayList<>();

            for (AIResumeScreening screening :
                    latestScreenings.values()) {

                AIScreeningManagementDto dto =
                        new AIScreeningManagementDto();

                dto.setScreeningId(
                        screening.getId()
                );

                dto.setCandidateId(
                        screening.getCandidateId()
                );

                dto.setJobId(
                        screening.getJobId()
                );

                dto.setYearsOfExperience(
                        screening.getYearsOfExperience()
                );

                dto.setSkills(
                        screening.getSkills()
                );

                dto.setAiMatch(
                        screening.getScreeningScore()
                );

                dto.setResult(
                        screening.getScreeningResult()
                );

                dto.setRecommendation(
                        screening.getRecommendation()
                );

                dto.setScreenedAt(
                        screening.getScreenedAt()
                );


                candidateRepository
                        .findById(
                                screening.getCandidateId()
                        )
                        .ifPresent(
                                candidate -> {

                                    dto.setCandidateName(
                                            candidate.getName()
                                    );

                                    dto.setCandidateEmail(
                                            candidate.getEmail()
                                    );
                                }
                        );


                jobRepository
                        .findById(
                                screening.getJobId()
                        )
                        .ifPresent(
                                job ->
                                        dto.setPosition(
                                                job.getTitle()
                                        )
                        );

                result.add(dto);
            }

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Latest AI screening management data retrieved successfully",
                            result
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve AI screening management data",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // STATISTICS
    // =========================================================

    public ResponseEntity<ApiResponse<AIScreeningStatsDto>>
    getScreeningStats() {

        try {

            long totalScreened =
                    screeningRepository.count();

            long highMatch =
                    screeningRepository
                            .countByScreeningScoreGreaterThanEqual(
                                    80.0
                            );

            long recommended =
                    screeningRepository
                            .countByScreeningResultIgnoreCase(
                                    "QUALIFIED"
                            );

            long needsReview =
                    screeningRepository
                            .countByScreeningResultIgnoreCase(
                                    "REVIEW"
                            );

            AIScreeningStatsDto stats =
                    new AIScreeningStatsDto(
                            totalScreened,
                            highMatch,
                            recommended,
                            needsReview
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI screening statistics retrieved successfully",
                            stats
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to retrieve AI screening statistics",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // SEARCH
    // =========================================================

    public ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
    searchScreenings(String keyword) {

        try {

            ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
                    response =
                    getScreeningManagementData();

            List<AIScreeningManagementDto> screenings =
                    response.getBody() != null &&
                            response.getBody().getData() != null
                            ? response.getBody().getData()
                            : new ArrayList<>();

            String search =
                    keyword == null
                            ? ""
                            : keyword.trim().toLowerCase();

            List<AIScreeningManagementDto> filtered =
                    screenings.stream()
                            .filter(
                                    dto ->
                                            containsIgnoreCase(
                                                    dto.getCandidateName(),
                                                    search
                                            )
                                                    ||
                                                    containsIgnoreCase(
                                                            dto.getCandidateEmail(),
                                                            search
                                                    )
                                                    ||
                                                    containsIgnoreCase(
                                                            dto.getPosition(),
                                                            search
                                                    )
                                                    ||
                                                    containsIgnoreCase(
                                                            dto.getSkills(),
                                                            search
                                                    )
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI screening search completed successfully",
                            filtered
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to search AI screenings",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // FILTER BY RESULT
    // =========================================================

    public ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
    filterByResult(String result) {

        try {

            ResponseEntity<ApiResponse<List<AIScreeningManagementDto>>>
                    response =
                    getScreeningManagementData();

            List<AIScreeningManagementDto> screenings =
                    response.getBody() != null &&
                            response.getBody().getData() != null
                            ? response.getBody().getData()
                            : new ArrayList<>();

            List<AIScreeningManagementDto> filtered =
                    screenings.stream()
                            .filter(
                                    dto ->
                                            dto.getResult() != null &&
                                                    dto.getResult()
                                                            .equalsIgnoreCase(
                                                                    result
                                                            )
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI screenings filtered successfully",
                            filtered
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            new ApiResponse<>(
                                    false,
                                    "Failed to filter AI screenings",
                                    null
                            )
                    );
        }
    }


    // =========================================================
    // STRING SEARCH HELPER
    // =========================================================

    private boolean containsIgnoreCase(
            String value,
            String search) {

        return value != null &&
                value.toLowerCase()
                        .contains(search);
    }
}
