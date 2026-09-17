package com.ems.repository;

import com.ems.common.InterviewStatus;
import com.ems.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    List<Interview> findByCandidateId(Long candidateId);

    List<Interview> findByJobId(Long jobId);

    long countByStatus(InterviewStatus status);

    List<Interview>
    findTop5ByStatusAndInterviewDateTimeAfterOrderByInterviewDateTimeAsc(
            InterviewStatus interviewStatus,
            LocalDateTime now
    );

    @Query("""
       SELECT i.status, COUNT(i)
       FROM Interview i
       WHERE i.status IS NOT NULL
       GROUP BY i.status
       """)
    List<Object[]> countInterviewsByStatus();

    @Query("""
       SELECT COUNT(i)
       FROM Interview i
       WHERE i.jobId IN (
           SELECT j.id
           FROM Job j
           WHERE LOWER(j.department) = LOWER(:department)
       )
       """)
    long countInterviewsByDepartment(
            @Param("department") String department
    );

    // Interviewer - My Interviews

    List<Interview> findByInterviewerId(Long interviewerId);

    List<Interview> findByInterviewerIdAndStatus(
            Long interviewerId,
            InterviewStatus status
    );

    List<Interview> findByInterviewerIdAndInterviewDateTimeBetween(
            Long interviewerId,
            LocalDateTime start,
            LocalDateTime end
    );

<<<<<<< Updated upstream
    Optional<Object> findFirstByCandidateIdAndJobIdOrderByInterviewDateTimeDesc(Long candidateId, Long jobId);


    List<Interview> findByStatus(InterviewStatus status);


    List<Interview>
    findByInterviewDateTimeGreaterThanEqualOrderByInterviewDateTimeAsc(
            LocalDateTime dateTime
=======
    // Existing Candidate Decision functionality

    Optional<Interview> findFirstByCandidateIdAndJobIdOrderByInterviewDateTimeDesc(
            Long candidateId,
            Long jobId
>>>>>>> Stashed changes
    );
}