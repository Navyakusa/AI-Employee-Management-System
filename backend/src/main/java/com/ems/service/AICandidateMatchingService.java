package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.AICandidateMatchingRequestDto;
import com.ems.dto.AICandidateMatchingResponseDto;
import com.ems.entity.AICandidateMatching;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.mapper.AICandidateMatchingMapper;
import com.ems.repository.AICandidateMatchingRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class AICandidateMatchingService {

    @Autowired
    private AICandidateMatchingRepository matchingRepository;

    @Autowired
    private AICandidateMatchingMapper matchingMapper;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;


    public ResponseEntity<ApiResponse<AICandidateMatchingResponseDto>> matchCandidate(
            AICandidateMatchingRequestDto requestDto) {

        try {

            Resume resume = resumeRepository.findByCandidateId(requestDto.getCandidateId())
                    .orElseThrow(() -> new RuntimeException(
                            "Resume not found for candidate ID: " + requestDto.getCandidateId()
                    ));

            Job job = jobRepository.findById(requestDto.getJobId())
                    .orElseThrow(() -> new RuntimeException(
                            "Job not found with ID: " + requestDto.getJobId()
                    ));

            AICandidateMatching matching = matchingMapper.toEntity(requestDto);

            String resumeText = safeText(resume.getExtractedText());
            String resumeSkills = safeText(resume.getExtractedSkills());
            String resumeExperience = safeText(resume.getExtractedExperience());
            String resumeEducation = safeText(resume.getExtractedEducation());

            String jobSkills = safeText(job.getRequiredSkills());
            String jobDescription = safeText(job.getDescription());
            String jobEducation = safeText(job.getEducation());
            String jobLocation = safeText(job.getLocation());
            String jobTitle = safeText(job.getTitle());

            double skillMatch = calculateSkillMatch(
                    resumeSkills,
                    jobSkills
            );

            double experienceMatch = calculateExperienceMatch(
                    resumeExperience,
                    job.getExperienceMin(),
                    job.getExperienceMax()
            );

            double educationMatch = calculateEducationMatch(
                    resumeEducation,
                    jobEducation
            );

            double certificationMatch = calculateCertificationMatch(
                    resumeText,
                    jobDescription
            );

            double locationMatch = calculateLocationMatch(
                    resumeText,
                    jobLocation
            );

            double roleMatch = calculateRoleMatch(
                    resumeText,
                    jobTitle
            );

            double overallScore =
                    (skillMatch * 0.40)
                    + (experienceMatch * 0.25)
                    + (educationMatch * 0.10)
                    + (certificationMatch * 0.10)
                    + (locationMatch * 0.05)
                    + (roleMatch * 0.10);

            overallScore = roundScore
                    (overallScore);

            matching.setSkillMatch(roundScore(skillMatch));
            matching.setExperienceMatch(roundScore(experienceMatch));
            matching.setEducationMatch(roundScore(educationMatch));
            matching.setCertificationMatch(roundScore(certificationMatch));
            matching.setLocationMatch(roundScore(locationMatch));
            matching.setRoleMatch(roundScore(roleMatch));
            matching.setOverallMatchScore(overallScore);

            matching.setExplanation(
                    buildExplanation(
                            skillMatch,
                            experienceMatch,
                            educationMatch,
                            certificationMatch,
                            locationMatch,
                            roleMatch,
                            overallScore
                    )
            );

            AICandidateMatching savedMatching =
                    matchingRepository.save(matching);

            AICandidateMatchingResponseDto responseDto =
                    matchingMapper.toResponseDto(savedMatching);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            true,
                            "AI candidate matching completed successfully",
                            responseDto
                    ));

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to perform AI candidate matching: " + e.getMessage(),
                            null
                    ));
        }
    }


    private double calculateSkillMatch(
            String resumeSkills,
            String jobSkills) {

        if (resumeSkills.isBlank() || jobSkills.isBlank()) {
            return 0.0;
        }

        List<String> candidateSkills = splitValues(resumeSkills);

        List<String> requiredSkills = splitValues(jobSkills);

        if (requiredSkills.isEmpty()) {
            return 0.0;
        }

        long matchedSkills = requiredSkills.stream()
                .filter(requiredSkill ->
                        candidateSkills.stream()
                                .anyMatch(candidateSkill ->
                                        candidateSkill.contains(requiredSkill)
                                                || requiredSkill.contains(candidateSkill)
                                )
                )
                .count();

        return (matchedSkills * 100.0) / requiredSkills.size();
    }


    private double calculateExperienceMatch(
            String resumeExperience,
            Integer experienceMin,
            Integer experienceMax) {

        if (experienceMin == null && experienceMax == null) {
            return 100.0;
        }

        double candidateYears =
                extractYearsOfExperience(resumeExperience);

        int minimumExperience =
                experienceMin != null ? experienceMin : 0;

        int maximumExperience =
                experienceMax != null ? experienceMax : Integer.MAX_VALUE;

        if (candidateYears >= minimumExperience
                && candidateYears <= maximumExperience) {

            return 100.0;
        }

        if (candidateYears >= minimumExperience) {
            return 100.0;
        }

        if (minimumExperience == 0) {
            return 100.0;
        }

        return Math.min(
                100.0,
                (candidateYears / minimumExperience) * 100.0
        );
    }


    private double calculateEducationMatch(
            String resumeEducation,
            String jobEducation) {

        if (jobEducation.isBlank()) {
            return 100.0;
        }

        if (resumeEducation.isBlank()) {
            return 0.0;
        }

        String candidateEducation =
                resumeEducation.toLowerCase(Locale.ROOT);

        String requiredEducation =
                jobEducation.toLowerCase(Locale.ROOT);

        if (candidateEducation.contains(requiredEducation)
                || requiredEducation.contains(candidateEducation)) {

            return 100.0;
        }

        String[] educationKeywords = {
                "b.tech",
                "btech",
                "b.e",
                "be",
                "bachelor",
                "m.tech",
                "mtech",
                "m.e",
                "me",
                "master",
                "mba",
                "phd",
                "doctorate"
        };

        for (String keyword : educationKeywords) {

            if (requiredEducation.contains(keyword)
                    && candidateEducation.contains(keyword)) {

                return 100.0;
            }
        }

        return 0.0;
    }


    private double calculateCertificationMatch(
            String resumeText,
            String jobDescription) {

        if (resumeText.isBlank()) {
            return 0.0;
        }

        String resumeLower =
                resumeText.toLowerCase(Locale.ROOT);

        String jobLower =
                jobDescription.toLowerCase(Locale.ROOT);

        if (jobLower.isBlank()) {
            return 100.0;
        }

        String[] certificationKeywords = {
                "certification",
                "certified",
                "certificate",
                "aws",
                "azure",
                "google cloud",
                "gcp",
                "oracle",
                "microsoft"
        };

        boolean candidateHasCertification = false;

        for (String keyword : certificationKeywords) {

            if (resumeLower.contains(keyword)) {
                candidateHasCertification = true;
                break;
            }
        }

        if (!candidateHasCertification) {
            return 0.0;
        }

        for (String keyword : certificationKeywords) {

            if (jobLower.contains(keyword)
                    && resumeLower.contains(keyword)) {

                return 100.0;
            }
        }

        return 50.0;
    }


    private double calculateLocationMatch(
            String resumeText,
            String jobLocation) {

        if (jobLocation.isBlank()) {
            return 100.0;
        }

        if (resumeText.isBlank()) {
            return 0.0;
        }

        String resumeLower =
                resumeText.toLowerCase(Locale.ROOT);

        String locationLower =
                jobLocation.toLowerCase(Locale.ROOT);

        if (resumeLower.contains(locationLower)) {
            return 100.0;
        }

        String[] locationParts =
                locationLower.split("[,\\s]+");

        for (String part : locationParts) {

            if (part.length() >= 3
                    && resumeLower.contains(part)) {

                return 100.0;
            }
        }

        return 0.0;
    }


    private double calculateRoleMatch(
            String resumeText,
            String jobTitle) {

        if (jobTitle.isBlank()) {
            return 100.0;
        }

        if (resumeText.isBlank()) {
            return 0.0;
        }

        String resumeLower =
                resumeText.toLowerCase(Locale.ROOT);

        String jobTitleLower =
                jobTitle.toLowerCase(Locale.ROOT);

        String[] roleWords =
                jobTitleLower.split("\\s+");

        int totalWords = 0;
        int matchedWords = 0;

        for (String word : roleWords) {

            if (word.length() < 3) {
                continue;
            }

            totalWords++;

            if (resumeLower.contains(word)) {
                matchedWords++;
            }
        }

        if (totalWords == 0) {
            return 0.0;
        }

        return (matchedWords * 100.0) / totalWords;
    }


    private double extractYearsOfExperience(
            String experience) {

        if (experience == null || experience.isBlank()) {
            return 0.0;
        }

        double totalYears = 0.0;

        String text =
                experience.toLowerCase(Locale.ROOT);

        java.util.regex.Pattern yearsPattern =
                java.util.regex.Pattern.compile(
                        "(\\d+(?:\\.\\d+)?)\\s*(?:years?|yrs?)"
                );

        java.util.regex.Matcher yearsMatcher =
                yearsPattern.matcher(text);

        while (yearsMatcher.find()) {

            totalYears += Double.parseDouble(
                    yearsMatcher.group(1)
            );
        }

        java.util.regex.Pattern monthsPattern =
                java.util.regex.Pattern.compile(
                        "(\\d+(?:\\.\\d+)?)\\s*(?:months?|mos?)"
                );

        java.util.regex.Matcher monthsMatcher =
                monthsPattern.matcher(text);

        while (monthsMatcher.find()) {

            totalYears += Double.parseDouble(
                    monthsMatcher.group(1)
            ) / 12.0;
        }

        return totalYears;
    }


    private List<String> splitValues(String value) {

        return java.util.Arrays.stream(
                        value.toLowerCase(Locale.ROOT)
                                .split("[,;|]")
                )
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .collect(Collectors.toList());
    }


    private String safeText(String value) {

        return value == null ? "" : value.trim();
    }


    private double roundScore(double value) {

        return Math.round(value * 100.0) / 100.0;
    }


    private String buildExplanation(
            double skillMatch,
            double experienceMatch,
            double educationMatch,
            double certificationMatch,
            double locationMatch,
            double roleMatch,
            double overallScore) {

        return "Match Score Explanation: "
                + "Skill Match = " + roundScore(skillMatch) + "% (40% weight), "
                + "Experience Match = " + roundScore(experienceMatch) + "% (25% weight), "
                + "Education Match = " + roundScore(educationMatch) + "% (10% weight), "
                + "Certification Match = " + roundScore(certificationMatch) + "% (10% weight), "
                + "Location Match = " + roundScore(locationMatch) + "% (5% weight), "
                + "Role Similarity = " + roundScore(roleMatch) + "% (10% weight). "
                + "Overall Match Score = " + overallScore + "%.";
    }


    public ResponseEntity<ApiResponse<List<AICandidateMatchingResponseDto>>> getAllMatches() {

        try {

            List<AICandidateMatchingResponseDto> matches =
                    matchingRepository.findAll()
                            .stream()
                            .map(matchingMapper::toResponseDto)
                            .collect(Collectors.toList());

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI candidate matches retrieved successfully",
                            matches
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve AI candidate matches: "
                                    + e.getMessage(),
                            null
                    ));
        }
    }


    public ResponseEntity<ApiResponse<AICandidateMatchingResponseDto>> getMatchById(
            Long id) {

        try {

            AICandidateMatching matching =
                    matchingRepository.findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "AI candidate matching record not found with ID: "
                                                    + id
                                    )
                            );

            return ResponseEntity.ok(
                    new ApiResponse<>(
                            true,
                            "AI candidate match retrieved successfully",
                            matchingMapper.toResponseDto(matching)
                    )
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            false,
                            "Failed to retrieve AI candidate match: "
                                    + e.getMessage(),
                            null
                    ));
        }
    }
}