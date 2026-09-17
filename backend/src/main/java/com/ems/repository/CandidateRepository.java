package com.ems.repository;

import com.ems.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    Optional<Candidate> findByEmailIgnoreCase(String email);
    List<Candidate> findByNameContainingIgnoreCase(String name);

    List<Candidate> findByStatusIgnoreCase(String status);

    List<Candidate> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name,
            String email
    );

    long countByStatusIgnoreCase(String status);
}