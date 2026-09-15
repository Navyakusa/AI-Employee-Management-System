package com.ems.repository;

import com.ems.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {

    Optional<Resume> findByCandidateId(Long candidateId);
    Optional<Resume> findFirstByCandidateIdOrderByIdDesc(
            Long candidateId
    );

}