package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.CandidateProfileDto;
import com.ems.dto.CandidateProfileUpdateDto;
import com.ems.entity.Candidate;
import com.ems.repository.CandidateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class CandidateProfileService {

    private final CandidateRepository candidateRepository;

    public CandidateProfileService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }

    public ResponseEntity<ApiResponse<CandidateProfileDto>> getMyProfile(String email) {

        Candidate candidate = candidateRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Candidate profile not found",
                            null
                    ));
        }

        CandidateProfileDto dto = mapToDto(candidate);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Candidate profile retrieved successfully",
                        dto
                )
        );
    }

    public ResponseEntity<ApiResponse<CandidateProfileDto>> updateMyProfile(
            String email,
            CandidateProfileUpdateDto updateDto
    ) {

        Candidate candidate = candidateRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);

        if (candidate == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Candidate profile not found",
                            null
                    ));
        }

        if (updateDto.getName() != null) {
            candidate.setName(updateDto.getName());
        }

        if (updateDto.getPhone() != null) {
            candidate.setPhone(updateDto.getPhone());
        }

        if (updateDto.getLocation() != null) {
            candidate.setLocation(updateDto.getLocation());
        }

        if (updateDto.getEducation() != null) {
            candidate.setEducation(updateDto.getEducation());
        }

        if (updateDto.getExperience() != null) {
            candidate.setExperience(updateDto.getExperience());
        }

        if (updateDto.getSkills() != null) {
            candidate.setSkills(updateDto.getSkills());
        }

        if (updateDto.getLinkedin() != null) {
            candidate.setLinkedin(updateDto.getLinkedin());
        }

        if (updateDto.getPortfolio() != null) {
            candidate.setPortfolio(updateDto.getPortfolio());
        }

        if (updateDto.getExpectedSalary() != null) {
            candidate.setExpectedSalary(updateDto.getExpectedSalary());
        }

        if (updateDto.getNoticePeriod() != null) {
            candidate.setNoticePeriod(updateDto.getNoticePeriod());
        }

        Candidate savedCandidate = candidateRepository.save(candidate);

        CandidateProfileDto responseDto = mapToDto(savedCandidate);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Candidate profile updated successfully",
                        responseDto
                )
        );
    }

    private CandidateProfileDto mapToDto(Candidate candidate) {

        CandidateProfileDto dto = new CandidateProfileDto();

        dto.setId(candidate.getId());
        dto.setName(candidate.getName());
        dto.setEmail(candidate.getEmail());
        dto.setPhone(candidate.getPhone());
        dto.setLocation(candidate.getLocation());
        dto.setEducation(candidate.getEducation());
        dto.setExperience(candidate.getExperience());
        dto.setSkills(candidate.getSkills());
        dto.setResume(candidate.getResume());
        dto.setLinkedin(candidate.getLinkedin());
        dto.setPortfolio(candidate.getPortfolio());
        dto.setExpectedSalary(candidate.getExpectedSalary());
        dto.setNoticePeriod(candidate.getNoticePeriod());
        dto.setSource(candidate.getSource());
        dto.setApplicationDate(candidate.getApplicationDate());
        dto.setStatus(candidate.getStatus());

        return dto;
    }
}