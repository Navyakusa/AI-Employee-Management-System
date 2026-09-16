package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.AIResumeScreeningRequestDto;
import com.ems.dto.AIResumeScreeningResponseDto;
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

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    public ResponseEntity<ApiResponse<AIResumeScreeningResponseDto>> screenResume(
            AIResumeScreeningRequestDto requestDto) {

        try {

            /*
             * Get the latest resume uploaded by the candidate.
             *
             * A candidate can have more than one resume.
             * Therefore, we select the resume with the highest ID,
             * which represents the latest uploaded resume in the
             * current Resume table.
             */
            Resume resume = resumeRepository
                    .findFirstByCandidateIdOrderByIdDesc(
                            requestDto.getCandidateId()
                    )
                    .orElseThrow(() -> new RuntimeException(
                            "Resume not found for candidate ID: "
                                    + requestDto.getCandidateId()));

            Job job = jobRepository
                    .findById(requestDto.getJobId())
                    .orElseThrow(() -> new RuntimeException(
                            "Job not found with ID: "
                                    + requestDto.getJobId()));

            AIResumeScreening screening =
                    screeningMapper.toEntity(requestDto);

            String resumeText = resume.getExtractedText();

            screening.setSkills(resume.getExtractedSkills());

            screening.setExperience(
                    extractSection(
                            resumeText,
                            "EXPERIENCE & INTERNSHIP",
                            "EXPERIENCE",
                            "INTERNSHIP",
                            "PROJECT EXPERIENCE"
                    )
            );

            screening.setEducation(
                    resume.getExtractedEducation()
            );

            screening.setCertifications(
                    extractSection(
                            resumeText,
                            "PARTICIPATION & CERTIFICATIONS",
                            "CERTIFICATIONS",
                            "CERTIFICATION"
                    )
            );

            screening.setJobTitles(
                    extractJobTitles(resumeText)
            );

            screening.setCompanies(
                    extractCompanies(resumeText)
            );

            screening.setTechnologies(
                    extractTechnologies(resumeText)
            );

            screening.setProjects(
                    extractSection(
                            resumeText,
                            "PROJECT EXPERIENCE",
                            "PROJECTS",
                            "PROJECT"
                    )
            );

            screening.setYearsOfExperience(
                    extractYearsOfExperience(
                            screening.getExperience()
                    )
            );

            String jobDescription = job.getDescription();

            double screeningScore =
                    calculateScreeningScore(
                            resume,
                            jobDescription
                    );

            screening.setScreeningScore(screeningScore);

            if (screeningScore >= 70) {

                screening.setScreeningResult("QUALIFIED");

                screening.setRecommendation(
                        "Candidate appears suitable for further HR screening."
                );

            } else if (screeningScore >= 50) {

                screening.setScreeningResult("REVIEW");

                screening.setRecommendation(
                        "Candidate requires further manual review."
                );

            } else {

                screening.setScreeningResult("NOT_QUALIFIED");

                screening.setRecommendation(
                        "Candidate does not sufficiently match the job requirements."
                );
            }

            AIResumeScreening savedScreening =
                    screeningRepository.save(screening);

            AIResumeScreeningResponseDto responseDto =
                    screeningMapper.toResponseDto(savedScreening);

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

    private String extractSection(
            String text,
            String... sectionNames) {

        if (text == null || text.isBlank()) {
            return "";
        }

        String normalizedText =
                text.replace("\r", "\n");

        for (String sectionName : sectionNames) {

            Pattern pattern = Pattern.compile(
                    "(?is)"
                            + Pattern.quote(sectionName)
                            + "\\s*(.*?)(?=\\n[A-Z][A-Z &]+\\n|$)"
            );

            Matcher matcher =
                    pattern.matcher(normalizedText);

            if (matcher.find()) {

                String section =
                        matcher.group(1).trim();

                if (!section.isBlank()) {
                    return section;
                }
            }
        }

        return "";
    }

    private String extractJobTitles(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        String lowerText = text.toLowerCase();

        StringBuilder result =
                new StringBuilder();

        String[] jobTitles = {
                "software engineer",
                "software developer",
                "java developer",
                "python developer",
                "backend developer",
                "frontend developer",
                "full stack developer",
                "data analyst",
                "data scientist",
                "machine learning engineer",
                "ai engineer",
                "web developer",
                "developer",
                "engineer",
                "intern"
        };

        for (String jobTitle : jobTitles) {

            if (lowerText.contains(jobTitle)) {

                if (result.length() > 0) {
                    result.append(", ");
                }

                result.append(jobTitle);
            }
        }

        return result.toString();
    }

    private String extractCompanies(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        StringBuilder result =
                new StringBuilder();

        String[] knownOrganizations = {
                "Microsoft",
                "SAP",
                "Edunet Foundation",
                "Innomatics Research Labs",
                "Vaagdevi Engineering College",
                "Shivani Junior College",
                "AICTE",
                "TechSaksham"
        };

        for (String organization : knownOrganizations) {

            if (text.toLowerCase()
                    .contains(organization.toLowerCase())) {

                if (result.length() > 0) {
                    result.append(", ");
                }

                result.append(organization);
            }
        }

        return result.toString();
    }

    private String extractTechnologies(String text) {

        if (text == null || text.isBlank()) {
            return "";
        }

        String lowerText =
                text.toLowerCase();

        String[] technologies = {
                "java",
                "python",
                "javascript",
                "typescript",
                "spring",
                "spring boot",
                "react",
                "angular",
                "node.js",
                "sql",
                "postgresql",
                "mysql",
                "mongodb",
                "docker",
                "kubernetes",
                "git",
                "github",
                "tensorflow",
                "keras",
                "django",
                "pandas",
                "numpy",
                "matplotlib",
                "opencv",
                "flask",
                "html",
                "css",
                "bootstrap",
                "linux",
                "windows",
                "machine learning",
                "deep learning",
                "nlp",
                "cnn",
                "tf-idf",
                "word embeddings"
        };

        StringBuilder result =
                new StringBuilder();

        for (String technology : technologies) {

            if (lowerText.contains(
                    technology.toLowerCase())) {

                if (result.length() > 0) {
                    result.append(", ");
                }

                result.append(technology);
            }
        }

        return result.toString();
    }

    private Double extractYearsOfExperience(
            String experience) {

        if (experience == null
                || experience.isBlank()) {

            return 0.0;
        }

        Pattern yearPattern =
                Pattern.compile(
                        "(\\d+(?:\\.\\d+)?)\\s*(?:years?|yrs?)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher yearMatcher =
                yearPattern.matcher(experience);

        double totalYears = 0.0;

        while (yearMatcher.find()) {

            totalYears += Double.parseDouble(
                    yearMatcher.group(1)
            );
        }

        Pattern monthPattern =
                Pattern.compile(
                        "(\\d+(?:\\.\\d+)?)\\s*(?:months?|mos?)",
                        Pattern.CASE_INSENSITIVE
                );

        Matcher monthMatcher =
                monthPattern.matcher(experience);

        while (monthMatcher.find()) {

            totalYears +=
                    Double.parseDouble(
                            monthMatcher.group(1)
                    ) / 12.0;
        }

        return Math.round(totalYears * 100.0)
                / 100.0;
    }

    private double calculateScreeningScore(
            Resume resume,
            String jobDescription) {

        if (resume.getExtractedSkills() == null
                || resume.getExtractedSkills().isBlank()
                || jobDescription == null
                || jobDescription.isBlank()) {

            return 0.0;
        }

        String resumeSkills =
                resume.getExtractedSkills()
                        .toLowerCase();

        String jobText =
                jobDescription.toLowerCase();

        String[] skills =
                resumeSkills.split(",");

        int matchedSkills = 0;
        int totalSkills = 0;

        for (String skill : skills) {

            String cleanedSkill =
                    skill.trim();

            if (!cleanedSkill.isBlank()) {

                totalSkills++;

                if (jobText.contains(cleanedSkill)) {
                    matchedSkills++;
                }
            }
        }

        if (totalSkills == 0) {
            return 0.0;
        }

        return Math.round(
                ((double) matchedSkills / totalSkills)
                        * 100
                        * 100.0
        ) / 100.0;
    }

    public ResponseEntity<ApiResponse<List<AIResumeScreeningResponseDto>>>
    getAllScreenings() {

        try {

            List<AIResumeScreeningResponseDto> screenings =
                    screeningRepository
                            .findAll()
                            .stream()
                            .map(screeningMapper::toResponseDto)
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
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
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
                            screeningMapper.toResponseDto(screening)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            new ApiResponse<>(
                                    false,
                                    e.getMessage(),
                                    null
                            )
                    );
        }
    }
}