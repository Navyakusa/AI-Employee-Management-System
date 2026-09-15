package com.ems.repository;

import com.ems.common.ApiResponse;
import com.ems.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.http.ResponseEntity;

import java.util.Collection;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Search jobs by title

    // Search jobs by location

    // Search jobs by title and location
    
    // Count jobs by status
    long countByStatusIgnoreCase(String status);

    // Get latest 5 jobs
    Collection<Job> findTop5ByOrderByCreatedDateDesc();

    // Job status statistics
    @Query("""
       SELECT j.status, COUNT(j)
       FROM Job j
       WHERE j.status IS NOT NULL
       GROUP BY j.status
       """)
    List<Object[]> countJobsByStatus();

    // Get jobs assigned to a Hiring Manager
    List<Job> findByHiringManagerId(Long hiringManagerId);

    ResponseEntity<ApiResponse<List<Job>>> findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(String title, String location);

    ResponseEntity<ApiResponse<List<Job>>> findByTitleContainingIgnoreCase(String title);

    ResponseEntity<ApiResponse<List<Job>>> findByLocationContainingIgnoreCase(String location);

    long countByDepartmentIgnoreCase(String department);

    long countByDepartmentIgnoreCaseAndStatusIgnoreCase(String department, String open);
}