package com.ems.controller;

import com.ems.entity.Candidate;
import com.ems.service.CandidateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    // Create a candidate
    @PostMapping("/create")
    public ResponseEntity<Candidate> createCandidate(
            @RequestBody Candidate candidate) {

        Candidate createdCandidate =
                candidateService.createCandidate(candidate);

        return ResponseEntity.ok(createdCandidate);
    }

    // Get all candidates
    @GetMapping("/all")
    public ResponseEntity<?> getAllCandidates() {

        return ResponseEntity.ok(
                candidateService.getAllCandidates()
        );
    }

    // Get candidate by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCandidateById(
            @PathVariable Long id) {

        Candidate candidate =
                candidateService.getCandidateById(id);

        if (candidate == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(candidate);
    }

    // Update candidate
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate candidate) {

        Candidate updatedCandidate =
                candidateService.updateCandidate(id, candidate);

        if (updatedCandidate == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedCandidate);
    }

    // Delete candidate
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCandidate(
            @PathVariable Long id) {

        Candidate existingCandidate =
                candidateService.getCandidateById(id);

        if (existingCandidate == null) {
            return ResponseEntity.notFound().build();
        }

        candidateService.deleteCandidate(id);

        return ResponseEntity.ok("Candidate deleted successfully");
    }
}