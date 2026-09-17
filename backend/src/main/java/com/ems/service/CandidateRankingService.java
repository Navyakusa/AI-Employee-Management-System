package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.*;
import com.ems.entity.AICandidateMatching;
import com.ems.entity.CandidateRanking;
import com.ems.mapper.CandidateRankingMapper;
import com.ems.repository.AICandidateMatchingRepository;
import com.ems.repository.CandidateRankingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.ems.entity.Application;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CandidateRankingService {

    @Autowired
    private CandidateRankingRepository rankingRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateRankingMapper rankingMapper;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private PythonAIClient pythonAIClient;


    public ResponseEntity<ApiResponse<List<CandidateRankingResponseDto>>> rankCandidates(CandidateRankingRequestDto requestDto) {

        try {

            Long jobId = requestDto.getJobId();

            Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found with ID: " + jobId));

            List<Application> applications = applicationRepository.findByJobId(jobId);

            if (applications.isEmpty()) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, "No candidates applied for job ID: " + jobId, null));
            }

            PythonRankingJobDto pythonJob = new PythonRankingJobDto();

            pythonJob.setJobId("J_" + job.getId());

            pythonJob.setJobTitle(safe(job.getTitle()));

            pythonJob.setSeniority(buildSeniority(job));

            pythonJob.setIndustry(safe(job.getDepartment()));
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

            pythonJob.setDescription(safe(job.getDescription()));

            pythonJob.setResponsibilities(safe(job.getResponsibilities()));

            pythonJob.setRequirements(buildRequirements(job));

            List<PythonRankingCandidateDto> candidates = new ArrayList<>();
            Map<String, Long> resumeCandidateMap = new HashMap<>();


            for (Application application : applications) {

                Long candidateId = application.getCandidateId();

                if (candidateId == null) {
                    continue;
                }

                Resume resume = resumeRepository.findFirstByCandidateIdOrderByIdDesc(candidateId).orElse(null);

                if (resume == null) {

                    System.out.println("Skipping candidate " + candidateId + " because resume was not found");

                    continue;
                }


                String pythonResumeId = "R_" + resume.getId();


                PythonRankingCandidateDto candidate = new PythonRankingCandidateDto();

                candidate.setResumeId(pythonResumeId);

                candidate.setRole("");

                candidate.setSeniority("");

                candidate.setIndustry("");

                candidate.setYearsExperience(0.0);

                candidate.setEducation(safe(resume.getExtractedEducation()));

                candidate.setSkills(
                        formatSkillsForPython(
                                resume.getExtractedSkills()
                        )
                );
                candidate.setSummary(safe(resume.getExtractedText()));

                candidate.setExperienceBullets(safe(resume.getExtractedExperience()));


                candidates.add(candidate);

                resumeCandidateMap.put(pythonResumeId, candidateId);
            }


            if (candidates.isEmpty()) {

                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(false, "No resumes found for candidates " + "who applied for job ID: " + jobId, null));
            }

            PythonRankingRequestDto pythonRequest = new PythonRankingRequestDto();

            pythonRequest.setJob(pythonJob);

            pythonRequest.setCandidates(candidates);

            pythonRequest.setTopN(candidates.size());

            List<PythonRankingResponseDto> pythonResponse = pythonAIClient.rankCandidates(pythonRequest);


            if (pythonResponse == null || pythonResponse.isEmpty()) {

                throw new RuntimeException("Python returned no candidate rankings");
            }

            List<CandidateRanking> oldRankings = rankingRepository.findByJobIdOrderByRankAsc(jobId);

            if (!oldRankings.isEmpty()) {
                rankingRepository.deleteAll(oldRankings);
            }

            List<CandidateRanking> rankings = new ArrayList<>();


            for (PythonRankingResponseDto aiResult : pythonResponse) {

                Long candidateId = resumeCandidateMap.get(aiResult.getResumeId());


                if (candidateId == null) {

                    System.out.println("Candidate mapping not found for " + aiResult.getResumeId());

                    continue;
                }


                CandidateRanking ranking = new CandidateRanking();

                ranking.setCandidateId(candidateId);

                ranking.setJobId(jobId);

                ranking.setMatchScore(aiResult.getMatchProbabilityPct());

                ranking.setRank(aiResult.getRank());
                ranking.setCandidateRole(
                        aiResult.getCandidateRole()
                );

                ranking.setMustHaveCoveragePct(
                        aiResult.getMustHaveCoveragePct()
                );

                ranking.setMissingMustHave(
                        aiResult.getMissingMustHave() == null
                                ? ""
                                : String.join(
                                ", ",
                                aiResult.getMissingMustHave()
                        )
                );

                rankings.add(ranking);
            }


            if (rankings.isEmpty()) {

                throw new RuntimeException("Unable to map Python rankings " + "to EMS candidates");
            }


            List<CandidateRanking> savedRankings = rankingRepository.saveAll(rankings);

            List<CandidateRankingResponseDto> response = savedRankings.stream().map(rankingMapper::toResponseDto).sorted(Comparator.comparing(CandidateRankingResponseDto::getRank)).collect(Collectors.toList());


            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(true, "Candidates ranked successfully using AI", response));


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to rank candidates: " + e.getMessage(), null));
        }
    }

    private String safe(String value) {

        return value == null ? "" : value;
    }


    private String buildSeniority(Job job) {

        Integer min = job.getExperienceMin();

        Integer max = job.getExperienceMax();

        if (min == null) {
            return "";
        }

        if (min >= 5) {
            return "Senior";
        }

        if (min >= 2) {
            return "Mid";
        }

        return "Junior";
    }


    private String buildRequirements(Job job) {

        StringBuilder requirements = new StringBuilder();

        if (job.getRequiredSkills() != null) {

            requirements.append("Required skills: ").append(job.getRequiredSkills());
        }

        if (job.getEducation() != null) {

            if (!requirements.isEmpty()) {
                requirements.append(". ");
            }

            requirements.append("Education: ").append(job.getEducation());
        }

        if (job.getExperienceMin() != null) {

            if (!requirements.isEmpty()) {
                requirements.append(". ");
            }

            requirements.append("Minimum experience: ").append(job.getExperienceMin()).append(" years");
        }

        return requirements.toString();
    }

    public ResponseEntity<ApiResponse<List<CandidateRankingResponseDto>>> getRankingsByJob(Long jobId) {

        try {

            List<CandidateRankingResponseDto> rankings = rankingRepository.findByJobIdOrderByRankAsc(jobId).stream().map(rankingMapper::toResponseDto).collect(Collectors.toList());

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidate rankings retrieved successfully", rankings));

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to retrieve candidate rankings: " + e.getMessage(), null));
        }
    }


    public ResponseEntity<ApiResponse<CandidateRankingResponseDto>> getRankingById(Long id) {

        try {

            CandidateRanking ranking = rankingRepository.findById(id).orElseThrow(() -> new RuntimeException("Candidate ranking not found with ID: " + id));

            return ResponseEntity.ok(new ApiResponse<>(true, "Candidate ranking retrieved successfully", rankingMapper.toResponseDto(ranking)));

        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Failed to retrieve candidate ranking: " + e.getMessage(), null));
        }
    }
    private String formatSkillsForPython(String skills) {

        if (skills == null || skills.isBlank()) {
            return "[]";
        }

        // Already in Python list representation
        if (skills.trim().startsWith("[")
                && skills.contains("'")) {
            return skills;
        }

        String[] skillArray = skills.split(",");

        StringBuilder result = new StringBuilder("[");

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
}