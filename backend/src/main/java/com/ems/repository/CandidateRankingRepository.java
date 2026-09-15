package com.ems.repository;

import com.ems.entity.CandidateRanking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRankingRepository extends JpaRepository<CandidateRanking, Long> {

    List<CandidateRanking> findByJobIdOrderByRankAsc(Long jobId);
    Optional<CandidateRanking>
    findByCandidateIdAndJobId(Long candidateId, Long jobId);}