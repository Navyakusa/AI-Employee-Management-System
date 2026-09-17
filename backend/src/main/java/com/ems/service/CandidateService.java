package com.ems.service;

import com.ems.dto.CandidateStatsDto;
import com.ems.entity.Candidate;
import com.ems.repository.CandidateRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepository;

    public CandidateService(CandidateRepository candidateRepository) {
        this.candidateRepository = candidateRepository;
    }
    // Search candidate by name or email
    public List<Candidate> searchCandidates(String keyword) {

        return candidateRepository
                .findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        keyword,
                        keyword
                );
    }


    // Filter candidates by status
    public List<Candidate> getCandidatesByStatus(String status) {

        return candidateRepository.findByStatusIgnoreCase(status);
    }


    // Candidate statistics
    public CandidateStatsDto getCandidateStats() {

        long totalCandidates = candidateRepository.count();

        long shortlisted =
                candidateRepository.countByStatusIgnoreCase("SHORTLISTED");

        return new CandidateStatsDto(
                totalCandidates,
                shortlisted
        );
    }
    // Create a candidate
    public Candidate createCandidate(Candidate candidate) {
        return candidateRepository.save(candidate);
    }

    // Get all candidates
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    // Get candidate by ID
    public Candidate getCandidateById(Long id) {
        return candidateRepository.findById(id).orElse(null);
    }

    // Update candidate
    public Candidate updateCandidate(Long id, Candidate updatedCandidate) {

        Candidate existingCandidate =
                candidateRepository.findById(id).orElse(null);

        if (existingCandidate == null) {
            return null;
        }

        existingCandidate.setName(updatedCandidate.getName());
        existingCandidate.setEmail(updatedCandidate.getEmail());
        existingCandidate.setPhone(updatedCandidate.getPhone());
        existingCandidate.setLocation(updatedCandidate.getLocation());

        existingCandidate.setEducation(updatedCandidate.getEducation());
        existingCandidate.setExperience(updatedCandidate.getExperience());
        existingCandidate.setSkills(updatedCandidate.getSkills());

        existingCandidate.setResume(updatedCandidate.getResume());
        existingCandidate.setLinkedin(updatedCandidate.getLinkedin());
        existingCandidate.setPortfolio(updatedCandidate.getPortfolio());

        existingCandidate.setExpectedSalary(
                updatedCandidate.getExpectedSalary()
        );

        existingCandidate.setNoticePeriod(
                updatedCandidate.getNoticePeriod()
        );

        existingCandidate.setSource(updatedCandidate.getSource());
        existingCandidate.setApplicationDate(
                updatedCandidate.getApplicationDate()
        );
        existingCandidate.setStatus(updatedCandidate.getStatus());

        return candidateRepository.save(existingCandidate);
    }

    // Delete candidate
    public void deleteCandidate(Long id) {
        candidateRepository.deleteById(id);
    }
}