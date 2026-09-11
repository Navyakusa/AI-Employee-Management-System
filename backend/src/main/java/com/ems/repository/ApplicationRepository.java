package com.ems.repository;

import com.ems.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ApplicationRepository
        extends JpaRepository<Application, Long> {

    List<Application> findByCandidateId(Long candidateId);

    List<Application> findByJobId(Long jobId);

    boolean existsByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );

    long countByStatus(
            com.ems.common.ApplicationStatus status
    );

    Long countByJobId(Long id);

    List<Application> findTop5ByOrderByAppliedAtDesc();

    @Query("""
       SELECT a.status, COUNT(a)
       FROM Application a
       WHERE a.status IS NOT NULL
       GROUP BY a.status
       """)
    List<Object[]> countApplicationsByStatus();

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
}