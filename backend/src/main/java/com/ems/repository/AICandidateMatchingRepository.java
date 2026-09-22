package com.ems.repository;

import com.ems.entity.AICandidateMatching;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AICandidateMatchingRepository
        extends JpaRepository<AICandidateMatching, Long> {

    Optional<AICandidateMatching>
    findFirstByCandidateIdAndJobIdOrderByIdDesc(
            Long candidateId,
            Long jobId
    );
}