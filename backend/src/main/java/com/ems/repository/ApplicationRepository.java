package com.ems.repository;

import com.ems.common.ApplicationStatus;
import com.ems.entity.Application;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    // =========================================================
    // CANDIDATE
    // =========================================================

    List<Application> findByCandidateId(Long candidateId);

    Optional<Application>
    findByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );

    boolean existsByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );

    long countByCandidateId(Long candidateId);

    List<Application>
    findTop5ByCandidateIdOrderByAppliedAtDesc(
            Long candidateId
    );

    Optional<Application>
    findFirstByCandidateIdOrderByAppliedAtDesc(
            Long candidateId
    );

    // =========================================================
    // JOB
    // =========================================================

    List<Application> findByJobId(Long jobId);

    Long countByJobId(Long jobId);

    // =========================================================
    // STATUS
    // =========================================================

    long countByStatus(ApplicationStatus status);

    List<Application> findByStatus(
            ApplicationStatus status
    );

    List<Application> findByStatusIn(
            List<ApplicationStatus> statuses
    );

    // =========================================================
    // RECENT APPLICATIONS
    // =========================================================

    List<Application>
    findTop5ByOrderByAppliedAtDesc();

    // =========================================================
    // APPLICATION STATUS STATISTICS
    // =========================================================

    @Query("""
        SELECT a.status, COUNT(a)
        FROM Application a
        WHERE a.status IS NOT NULL
        GROUP BY a.status
        """)
    List<Object[]> countApplicationsByStatus();

    // =========================================================
    // DEPARTMENT
    // =========================================================

    @Query("""
        SELECT COUNT(a)
        FROM Application a
        WHERE a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE LOWER(j.department) = LOWER(:department)
        )
        """)
    long countApplicationsByDepartment(
            @Param("department") String department
    );

    // =========================================================
    // HIRING MANAGER - FILTERED APPLICATIONS
    // =========================================================

    @Query("""
        SELECT a
        FROM Application a
        WHERE a.status = :status
        AND a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.hiringManagerId = :hiringManagerId
        )
        ORDER BY a.appliedAt DESC
        """)
    List<Application> findByStatusAndHiringManagerId(
            @Param("status") ApplicationStatus status,
            @Param("hiringManagerId") Long hiringManagerId
    );

    // =========================================================
    // HIRING MANAGER - TOTAL APPLICATIONS
    // =========================================================

    @Query("""
        SELECT COUNT(a)
        FROM Application a
        WHERE a.jobId IN (
            SELECT j.id
            FROM Job j
            WHERE j.hiringManagerId = :hiringManagerId
        )
        """)
    long countByHiringManagerId(
            @Param("hiringManagerId") Long hiringManagerId
    );
}