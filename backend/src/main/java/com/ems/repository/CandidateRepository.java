package com.ems.repository;

import com.ems.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository
        extends JpaRepository<Candidate, Long> {

    // Find Candidate profile using the email
    // from the authenticated user's JWT.
    Optional<Candidate> findByEmailIgnoreCase(String email);

    // Search candidates by name.
    List<Candidate> findByNameContainingIgnoreCase(
            String name
    );

    // Filter candidates by status.
    List<Candidate> findByStatusIgnoreCase(
            String status
    );

    // Search candidates by name OR email.
    List<Candidate>
    findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name,
            String email
    );

    // Count candidates by status.
    long countByStatusIgnoreCase(
            String status
    );
}