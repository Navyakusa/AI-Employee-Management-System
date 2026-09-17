package com.ems.repository;

import com.ems.entity.AIResumeScreening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIResumeScreeningRepository
        extends JpaRepository<AIResumeScreening, Long> {

    long countByScreeningResultIgnoreCase(String screeningResult);

    @Query("""
            SELECT AVG(a.screeningScore)
            FROM AIResumeScreening a
            WHERE a.screeningScore IS NOT NULL
            """)
    Double getAverageScreeningScore();

    List<AIResumeScreening> findTop5ByOrderByScreeningScoreDesc();

    Optional<AIResumeScreening>
    findFirstByCandidateIdAndJobIdOrderByIdDesc(
            Long candidateId,
            Long jobId
    );

    long countByScreeningScoreGreaterThanEqual(Double score);
}