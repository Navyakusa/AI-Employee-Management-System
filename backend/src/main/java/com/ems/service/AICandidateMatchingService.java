package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.AICandidateMatching;
import com.ems.entity.Candidate;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.mapper.AICandidateMatchingMapper;
import com.ems.repository.AICandidateMatchingRepository;
import com.ems.repository.CandidateRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AICandidateMatchingService {

    private final AICandidateMatchingRepository matchingRepository;
    private final AICandidateMatchingMapper matchingMapper;
    private final CandidateRepository candidateRepository;
    private final ResumeRepository resumeRepository;
    private final JobRepository jobRepository;
    private final PythonAIClient pythonAIClient;


    public ResponseEntity<ApiResponse<AICandidateMatchingResponseDto>>
    matchCandidate(AICandidateMatchingRequestDto requestDto) {

        try {

            // 1. Find candidate
            Candidate candidate = candidateRepository
                    .findById(requestDto.getCandidateId())
                    .orElse(null);

            if (candidate == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Candidate not found",
                                null
                        ));
            }


            // 2. Find job
            Job job = jobRepository
                    .findById(requestDto.getJobId())
                    .orElse(null);

            if (job == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Job not found",
                                null
                        ));
            }


            // 3. Find latest resume
            Resume resume = resumeRepository
                    .findFirstByCandidateIdOrderByIdDesc(
                            candidate.getId()
                    )
                    .orElse(null);

            if (resume == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "Resume not found for candidate",
                                null
                        ));
            }


            // 4. Build Python Job request
            PythonJobRequestDto pythonJob =
                    buildPythonJob(job);


            // 5. Build Python Resume request
            PythonResumeRequestDto pythonResume =
                    buildPythonResume(
                            candidate,
                            resume,
                            job
                    );


            // 6. Create Python request
            PythonMatchRequestDto pythonRequest =
                    new PythonMatchRequestDto(
                            pythonJob,
                            pythonResume
                    );


            // 7. Call Python FastAPI
            PythonMatchResponseDto pythonResponse =
                    pythonAIClient.matchCandidate(
                            pythonRequest
                    );


            if (pythonResponse == null) {

                return ResponseEntity
                        .status(HttpStatus.BAD_GATEWAY)
                        .body(new ApiResponse<>(
                                false,
                                "AI service returned empty response",
                                null
                        ));
            }


            // 8. Find existing match or create new
            AICandidateMatching matching =
                    matchingRepository
                            .findByCandidateIdAndJobId(
                                    candidate.getId(),
                                    job.getId()
                            )
                            .orElseGet(AICandidateMatching::new);


            matching.setCandidateId(
                    candidate.getId()
            );

            matching.setJobId(
                    job.getId()
            );


            // 9. Save overall AI score
            matching.setOverallMatchScore(
                    pythonResponse.getMatchProbabilityPct()
            );


            // 10. Extract individual feature scores
            setFeatureScores(
                    matching,
                    pythonResponse.getFeatures()
            );


            // 11. Save AI explanation
            matching.setExplanation(
                    buildExplanation(
                            pythonResponse
                    )
            );


            // 12. Save/update database
            AICandidateMatching savedMatching =
                    matchingRepository.save(
                            matching
                    );


            // 13. Map entity -> response DTO
            AICandidateMatchingResponseDto responseDto =
                    matchingMapper.toResponseDto(
                            savedMatching
                    );


            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "Candidate AI matching completed successfully",
                            responseDto
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "AI candidate matching failed: "
                                    + e.getMessage(),
                            null
                    ));
        }
    }


    private PythonJobRequestDto buildPythonJob(
            Job job) {

        PythonJobRequestDto dto =
                new PythonJobRequestDto();

        dto.setJobId(
                "J_" + job.getId()
        );

        dto.setJobTitle(
                safe(job.getTitle())
        );

        dto.setSeniority(
                determineSeniority(
                        job.getExperienceMin()
                )
        );

        dto.setIndustry(
                safe(job.getDepartment())
        );

        dto.setMustHaveSkills(
                convertSkillsToPythonFormat(
                        job.getRequiredSkills()
                )
        );

        dto.setNiceToHaveSkills(
                convertSkillsToPythonFormat(
                        job.getPreferredSkills()
                )
        );

        dto.setDescription(
                safe(job.getDescription())
        );

        dto.setResponsibilities(
                safe(job.getResponsibilities())
        );

        dto.setRequirements(
                buildJobRequirements(job)
        );

        return dto;
    }


    private PythonResumeRequestDto buildPythonResume(
            Candidate candidate,
            Resume resume,
            Job job) {

        PythonResumeRequestDto dto =
                new PythonResumeRequestDto();

        dto.setResumeId(
                "R_" + resume.getId()
        );

        /*
         * Candidate entity currently does not have a separate
         * role field. For matching against this specific job,
         * job title is used as the target role.
         */
        dto.setRole(
                safe(job.getTitle())
        );

        int years =
                extractYears(
                        candidate.getExperience()
                );

        dto.setYearsExperience(
                years
        );

        dto.setSeniority(
                determineSeniority(years)
        );

        dto.setIndustry(
                safe(job.getDepartment())
        );

        String education =
                candidate.getEducation();

        if (education == null ||
                education.isBlank()) {

            education =
                    resume.getExtractedEducation();
        }

        dto.setEducation(
                safe(education)
        );


        String skills =
                candidate.getSkills();

        if (skills == null ||
                skills.isBlank()) {

            skills =
                    resume.getExtractedSkills();
        }

        dto.setSkills(
                convertSkillsToPythonFormat(
                        skills
                )
        );


        dto.setSummary(
                safe(resume.getExtractedText())
        );

        /*
         * Your current Resume entity doesn't have a separate
         * experience_bullets column.
         *
         * Use extracted experience for now.
         */
        dto.setExperienceBullets(
                safe(
                        resume.getExtractedExperience()
                )
        );

        return dto;
    }


    private void setFeatureScores(
            AICandidateMatching matching,
            Map<String, Object> features) {

        if (features == null) {
            return;
        }

        // Python returns values between 0 and 1.
        // Convert them to percentage values between 0 and 100.

        Double mustSkillCoverage =
                getDouble(features, "must_skill_coverage");

        Double skillJaccard =
                getDouble(features, "skill_jaccard");

        Double seniorityMatch =
                getDouble(features, "seniority_match");

        Double roleSimilarity =
                getDouble(features, "role_similarity");


        // Skill match
        if (mustSkillCoverage != null) {

            matching.setSkillMatch(
                    mustSkillCoverage * 100
            );
        }


        // Experience match
        if (seniorityMatch != null) {

            matching.setExperienceMatch(
                    seniorityMatch * 100
            );
        }


        // Role match
        if (roleSimilarity != null) {

            matching.setRoleMatch(
                    roleSimilarity * 100
            );
        }
        matching.setEducationMatch(null);
        matching.setCertificationMatch(null);
        matching.setLocationMatch(null);
    }

    private Double getDouble(
            Map<String, Object> features,
            String key) {

        Object value =
                features.get(key);

        if (value instanceof Number number) {

            return number.doubleValue();
        }

        return null;
    }


    private String buildExplanation(
            PythonMatchResponseDto response) {

        if (response.getExplanation() != null &&
                !response.getExplanation().isEmpty()) {

            return response
                    .getExplanation()
                    .toString();
        }

        if (response.getResult() != null) {

            return response.getResult();
        }

        return "AI matching completed";
    }


    private String determineSeniority(
            Integer years) {

        if (years == null) {
            return "Junior";
        }

        if (years <= 2) {
            return "Junior";
        }

        if (years <= 5) {
            return "Mid";
        }

        return "Senior";
    }


    private int extractYears(
            String experience) {

        if (experience == null ||
                experience.isBlank()) {

            return 0;
        }

        String digits =
                experience.replaceAll(
                        "[^0-9]",
                        " "
                );

        String[] parts =
                digits.trim()
                        .split("\\s+");

        if (parts.length == 0 ||
                parts[0].isBlank()) {

            return 0;
        }

        try {

            return Integer.parseInt(
                    parts[0]
            );

        } catch (NumberFormatException e) {

            return 0;
        }
    }


    private String convertSkillsToPythonFormat(
            String skills) {

        if (skills == null ||
                skills.isBlank()) {

            return "[]";
        }

        String[] values =
                skills.split(",");

        StringBuilder builder =
                new StringBuilder("[");

        for (String value : values) {

            String skill =
                    value.trim();

            if (!skill.isEmpty()) {

                if (builder.length() > 1) {
                    builder.append(" ");
                }

                builder
                        .append("'")
                        .append(skill)
                        .append("'");
            }
        }

        builder.append("]");

        return builder.toString();
    }


    private String buildJobRequirements(
            Job job) {

        StringBuilder requirements =
                new StringBuilder();

        if (job.getExperienceMin() != null) {

            requirements
                    .append(job.getExperienceMin())
                    .append("+ years experience. ");
        }

        if (job.getEducation() != null &&
                !job.getEducation().isBlank()) {

            requirements
                    .append("Education: ")
                    .append(job.getEducation())
                    .append(". ");
        }

        if (job.getRequiredSkills() != null &&
                !job.getRequiredSkills().isBlank()) {

            requirements
                    .append("Required skills: ")
                    .append(job.getRequiredSkills())
                    .append(".");
        }

        return requirements
                .toString()
                .trim();
    }


    private String safe(
            String value) {

        return value == null
                ? ""
                : value;
    }


    public ResponseEntity<ApiResponse<List<AICandidateMatchingResponseDto>>>
    getAllMatches() {

        try {

            List<AICandidateMatchingResponseDto> matches =
                    matchingRepository
                            .findAll()
                            .stream()
                            .map(
                                    matchingMapper::toResponseDto
                            )
                            .toList();

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI candidate matches fetched successfully",
                            matches
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to fetch AI candidate matches",
                            null
                    ));
        }
    }


    public ResponseEntity<ApiResponse<AICandidateMatchingResponseDto>>
    getMatchById(Long id) {

        try {

            Optional<AICandidateMatching> optional =
                    matchingRepository.findById(id);

            if (optional.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                false,
                                "AI candidate match not found",
                                null
                        ));
            }

            AICandidateMatchingResponseDto dto =
                    matchingMapper.toResponseDto(
                            optional.get()
                    );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI candidate match fetched successfully",
                            dto
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to fetch AI candidate match",
                            null
                    ));
        }
    }
}