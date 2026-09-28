package com.ems.repository;

import com.ems.common.ApiResponse;
import com.ems.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;

import java.util.Collection;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // =========================================================
    // HIRING MANAGER
    // =========================================================

    long countByHiringManagerId(Long hiringManagerId);

    List<Job> findByHiringManagerId(Long hiringManagerId);

    // =========================================================
    // JOB STATUS
    // =========================================================

    long countByStatusIgnoreCase(String status);

    // =========================================================
    // LATEST JOBS
    // =========================================================

    Collection<Job> findTop5ByOrderByCreatedDateDesc();

    // =========================================================
    // JOB STATUS STATISTICS
    // =========================================================

    @Query("""
        SELECT j.status, COUNT(j)
        FROM Job j
        WHERE j.status IS NOT NULL
        GROUP BY j.status
        """)
    List<Object[]> countJobsByStatus();

    // =========================================================
    // JOB SEARCH
    // =========================================================

    ResponseEntity<ApiResponse<List<Job>>>
    findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(
            String title,
            String location
    );

    ResponseEntity<ApiResponse<List<Job>>>
    findByTitleContainingIgnoreCase(
            String title
    );

    ResponseEntity<ApiResponse<List<Job>>>
    findByLocationContainingIgnoreCase(
            String location
    );

    // =========================================================
    // DEPARTMENT
    // =========================================================

    long countByDepartmentIgnoreCase(
            String department
    );

    long countByDepartmentIgnoreCaseAndStatusIgnoreCase(
            String department,
            String status
    );
}