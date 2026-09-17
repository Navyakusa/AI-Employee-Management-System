package com.ems.repository;

import com.ems.common.InterviewStatus;
import com.ems.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    // Existing: get interviews for a candidate
    List<Interview> findByCandidateId(Long candidateId);

    // Existing: get interviews for a job
    List<Interview> findByJobId(Long jobId);

    // Existing: count interviews by status
    long countByStatus(InterviewStatus status);

    // Existing: get upcoming interviews
    List<Interview>
    findTop5ByStatusAndInterviewDateTimeAfterOrderByInterviewDateTimeAsc(
            InterviewStatus interviewStatus,
            LocalDateTime now
    );

    // Existing: dashboard interview status counts
    @Query("""
       SELECT i.status, COUNT(i)
       FROM Interview i
       WHERE i.status IS NOT NULL
       GROUP BY i.status
       """)
    List<Object[]> countInterviewsByStatus();

    // Existing: count interviews by department
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

    // ---------------------------------------------------------
    // Interviewer - My Interviews
    // ---------------------------------------------------------

    // Get all interviews assigned to a specific interviewer
    List<Interview> findByInterviewerId(Long interviewerId);

    // Get interviews assigned to an interviewer with a specific status
    List<Interview> findByInterviewerIdAndStatus(
            Long interviewerId,
            InterviewStatus status
    );

    // Get interviews assigned to an interviewer within a date/time range
    List<Interview> findByInterviewerIdAndInterviewDateTimeBetween(
            Long interviewerId,
            LocalDateTime start,
            LocalDateTime end
    );
}