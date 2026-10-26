
package com.ems.repository;

import com.ems.entity.AIResumeScreening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIResumeScreeningRepository
        extends JpaRepository<AIResumeScreening, Long> {

    // Find screenings for a candidate and a particular job
    List<AIResumeScreening> findByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );

    // Find the latest screening for a candidate and job
    Optional<AIResumeScreening>
    findFirstByCandidateIdAndJobIdOrderByIdDesc(
            Long candidateId,
            Long jobId
    );

    // Retrieve all screenings, newest screening date first
    List<AIResumeScreening> findAllByOrderByScreenedAtDesc();

    // Count candidates whose screening score meets the threshold
    long countByScreeningScoreGreaterThanEqual(double score);

    // Count screenings by result, ignoring letter case
    long countByScreeningResultIgnoreCase(String screeningResult);

    // Calculate the average screening score
    @Query("SELECT AVG(s.screeningScore) FROM AIResumeScreening s")
    Double getAverageScreeningScore();

    // Retrieve the five highest-scoring screenings
    List<AIResumeScreening>
    findTop5ByOrderByScreeningScoreDesc();
}
