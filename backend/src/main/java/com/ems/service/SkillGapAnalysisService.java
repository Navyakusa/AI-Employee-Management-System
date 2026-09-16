package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.entity.SkillGapAnalysis;
import com.ems.mapper.SkillGapAnalysisMapper;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;
import com.ems.repository.SkillGapAnalysisRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillGapAnalysisService {

    @Autowired
    private SkillGapAnalysisRepository skillGapAnalysisRepository;

    @Autowired
    private SkillGapAnalysisMapper skillGapAnalysisMapper;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private PythonAIClient pythonAIClient;


    // =========================================================
    // ANALYZE SKILL GAP
    // =========================================================

    public ResponseEntity<ApiResponse<SkillGapAnalysisResponseDto>> analyzeSkillGap(SkillGapAnalysisRequestDto requestDto) {

        try {

            // =============================================
            // 1. GET RESUME
            // =============================================

            Resume resume = resumeRepository.findByCandidateId(requestDto.getCandidateId()).orElseThrow(() -> new RuntimeException("Resume not found for candidate ID: " + requestDto.getCandidateId()));


            // =============================================
            // 2. GET JOB
            // =============================================

            Job job = jobRepository.findById(requestDto.getJobId()).orElseThrow(() -> new RuntimeException("Job not found with ID: " + requestDto.getJobId()));


            // =============================================
            // 3. EXPERIENCE
            // =============================================

            int yearsExperience = extractYears(resume.getExtractedExperience());


            // =============================================
            // 4. CREATE PYTHON JOB DTO
            // =============================================

            PythonJobRequestDto pythonJob = new PythonJobRequestDto();

            pythonJob.setJobId("J_" + job.getId());

            pythonJob.setJobTitle(safeText(job.getTitle()));

            pythonJob.setSeniority(determineJobSeniority(job.getExperienceMin()));

            pythonJob.setIndustry(safeText(job.getDepartment()).isBlank() ? "Engineering" : safeText(job.getDepartment()));

            pythonJob.setMustHaveSkills(toPythonSkillFormat(job.getRequiredSkills()));

            pythonJob.setNiceToHaveSkills(toPythonSkillFormat(job.getPreferredSkills()));

            pythonJob.setDescription(safeText(job.getDescription()));

            pythonJob.setResponsibilities(safeText(job.getResponsibilities()));

            pythonJob.setRequirements("Required skills: " + safeText(job.getRequiredSkills()));


            // =============================================
            // 5. CREATE PYTHON RESUME DTO
            // =============================================

            PythonResumeRequestDto pythonResume = new PythonResumeRequestDto();

            pythonResume.setResumeId("R_" + resume.getId());

            /*
             * Currently your Resume entity does not
             * appear to contain a dedicated role field.
             *
             * Job title is used as fallback.
             */

            pythonResume.setRole(safeText(job.getTitle()));

            pythonResume.setSeniority(determineResumeSeniority(yearsExperience));

            pythonResume.setIndustry(safeText(job.getDepartment()).isBlank() ? "Engineering" : safeText(job.getDepartment()));

            pythonResume.setYearsExperience(yearsExperience);

            pythonResume.setEducation(safeText(resume.getExtractedEducation()));

            pythonResume.setSkills(toPythonSkillFormat(resume.getExtractedSkills()));

            pythonResume.setSummary(safeText(resume.getExtractedText()));

            pythonResume.setExperienceBullets(safeText(resume.getExtractedExperience()));


            // =============================================
            // 6. CREATE PYTHON REQUEST
            // =============================================

            PythonSkillGapRequestDto pythonRequest = new PythonSkillGapRequestDto();

            pythonRequest.setJob(pythonJob);

            pythonRequest.setResume(pythonResume);


            System.out.println();
            System.out.println("=================================");

            System.out.println("CALLING PYTHON SKILL GAP");

            System.out.println("Candidate ID = " + requestDto.getCandidateId());

            System.out.println("Job ID = " + requestDto.getJobId());

            System.out.println("=================================");


            // =============================================
            // 7. CALL PYTHON
            // =============================================

            PythonSkillGapResponseDto pythonResponse = pythonAIClient.analyzeSkillGap(pythonRequest);


            if (pythonResponse == null) {

                throw new RuntimeException("Python returned null response");
            }


            System.out.println("PYTHON RESULT:");

            System.out.println("Must Have Coverage = " + pythonResponse.getMustHaveCoveragePct());

            System.out.println("Nice To Have Coverage = " + pythonResponse.getNiceToHaveCoveragePct());

            System.out.println("Missing Must Have = " + pythonResponse.getMissingMustHave());

            System.out.println("Missing Nice To Have = " + pythonResponse.getMissingNiceToHave());


            // =============================================
            // 8. GET MISSING REQUIRED SKILLS
            // =============================================

            List<String> missingMustHave = pythonResponse.getMissingMustHave() == null ? List.of() : pythonResponse.getMissingMustHave();


            // =============================================
            // 9. FIND MATCHING SKILLS
            // =============================================

            List<String> matchingSkills = findMatchingSkills(job.getRequiredSkills(), missingMustHave);


            // =============================================
            // 10. SAVE ENTITY
            // =============================================

            SkillGapAnalysis analysis = new SkillGapAnalysis();

            analysis.setCandidateId(requestDto.getCandidateId());

            analysis.setJobId(requestDto.getJobId());

            analysis.setCandidateSkills(safeText(resume.getExtractedSkills()));

            analysis.setRequiredSkills(safeText(job.getRequiredSkills()));

            analysis.setMatchingSkills(joinList(matchingSkills));

            analysis.setMissingSkills(joinList(missingMustHave));

            analysis.setSkillMatchPercentage(pythonResponse.getMustHaveCoveragePct());


            SkillGapAnalysis saved = skillGapAnalysisRepository.save(analysis);


            // =============================================
            // 11. ENTITY -> RESPONSE DTO
            // =============================================

            SkillGapAnalysisResponseDto responseDto = skillGapAnalysisMapper.toResponseDto(saved);


            return ResponseEntity.ok(new ApiResponse<>(true, "Skill gap analysis completed successfully", responseDto));


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to perform AI skill gap analysis: " + e.getMessage(), null));
        }
    }


    // =========================================================
    // GET ALL
    // =========================================================

    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResponseDto>>> getAllAnalyses() {

        try {

            List<SkillGapAnalysisResponseDto> analyses = skillGapAnalysisRepository.findAll().stream().map(skillGapAnalysisMapper::toResponseDto).collect(Collectors.toList());


            return ResponseEntity.ok(new ApiResponse<>(true, "Skill gap analyses retrieved successfully", analyses));


        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to retrieve skill gap analyses: " + e.getMessage(), null));
        }
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    public ResponseEntity<ApiResponse<SkillGapAnalysisResponseDto>> getAnalysisById(Long id) {

        try {

            SkillGapAnalysis analysis = skillGapAnalysisRepository.findById(id).orElseThrow(() -> new RuntimeException("Skill gap analysis not found with ID: " + id));


            return ResponseEntity.ok(new ApiResponse<>(true, "Skill gap analysis retrieved successfully", skillGapAnalysisMapper.toResponseDto(analysis)));


        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to retrieve skill gap analysis: " + e.getMessage(), null));
        }
    }


    // =========================================================
    // GET BY JOB
    // =========================================================

    public ResponseEntity<ApiResponse<List<SkillGapAnalysisResponseDto>>> getAnalysesByJob(Long jobId) {

        try {

            List<SkillGapAnalysisResponseDto> analyses = skillGapAnalysisRepository.findByJobId(jobId).stream().map(skillGapAnalysisMapper::toResponseDto).collect(Collectors.toList());


            return ResponseEntity.ok(new ApiResponse<>(true, "Skill gap analyses for job retrieved successfully", analyses));


        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to retrieve skill gap analyses: " + e.getMessage(), null));
        }
    }


    // =========================================================
    // FIND MATCHING SKILLS
    // =========================================================

    private List<String> findMatchingSkills(String requiredSkills, List<String> missingSkills) {

        if (requiredSkills == null || requiredSkills.isBlank()) {

            return List.of();
        }


        List<String> missing = missingSkills == null ? List.of() : missingSkills.stream().map(String::toLowerCase).toList();


        return Arrays.stream(requiredSkills.split("[,;|]")).map(String::trim).filter(skill -> !skill.isBlank()).filter(skill -> !missing.contains(skill.toLowerCase())).toList();
    }


    // =========================================================
    // DATABASE SKILLS -> PYTHON FORMAT
    //
    // Java, Spring Boot, React
    //
    // ->
    //
    // ['Java' 'Spring Boot' 'React']
    // =========================================================

    private String toPythonSkillFormat(String skills) {

        if (skills == null || skills.isBlank()) {

            return "[]";
        }


        String[] skillArray = skills.split("[,;|]");


        StringBuilder builder = new StringBuilder("[");


        for (String skill : skillArray) {

            String cleanSkill = skill.trim();


            if (!cleanSkill.isBlank()) {

                if (builder.length() > 1) {
                    builder.append(" ");
                }

                builder.append("'").append(cleanSkill).append("'");
            }
        }


        builder.append("]");

        return builder.toString();
    }


    // =========================================================
    // EXTRACT EXPERIENCE
    //
    // "4 Years" -> 4
    // =========================================================

    private int extractYears(String experience) {

        if (experience == null || experience.isBlank()) {

            return 0;
        }


        try {

            String number = experience.replaceAll("[^0-9]", " ").trim().split("\\s+")[0];


            return Integer.parseInt(number);


        } catch (Exception e) {

            return 0;
        }
    }


    // =========================================================
    // RESUME SENIORITY
    // =========================================================

    private String determineResumeSeniority(int years) {

        if (years <= 2) {

            return "Junior";

        } else if (years <= 5) {

            return "Mid";

        } else {

            return "Senior";
        }
    }


    // =========================================================
    // JOB SENIORITY
    // =========================================================

    private String determineJobSeniority(Integer experienceMin) {

        if (experienceMin == null) {

            return "Junior";
        }


        if (experienceMin <= 2) {

            return "Junior";

        } else if (experienceMin <= 5) {

            return "Mid";

        } else {

            return "Senior";
        }
    }


    // =========================================================
    // LIST -> STRING
    // =========================================================

    private String joinList(List<String> values) {

        if (values == null || values.isEmpty()) {

            return "";
        }


        return String.join(", ", values);
    }


    // =========================================================
    // NULL SAFE STRING
    // =========================================================

    private String safeText(String value) {

        return value == null ? "" : value.trim();
    }
}