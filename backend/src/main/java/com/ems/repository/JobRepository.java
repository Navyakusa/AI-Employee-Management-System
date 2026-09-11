package com.ems.repository;

import com.ems.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    // Search jobs by title
    List<Job> findByTitleContainingIgnoreCase(String title);

    // Search jobs by location
    List<Job> findByLocationContainingIgnoreCase(String location);

    // Search jobs by title and location
    List<Job> findByTitleContainingIgnoreCaseAndLocationContainingIgnoreCase(
            String title,
            String location
    );
    long countByStatusIgnoreCase(String status);

    Collection<Job> findTop5ByOrderByCreatedDateDesc();
    @Query("""
       SELECT j.status, COUNT(j)
       FROM Job j
       WHERE j.status IS NOT NULL
       GROUP BY j.status
       """)
    List<Object[]> countJobsByStatus();

    long countByDepartmentIgnoreCaseAndStatusIgnoreCase(String department, String open);

    long countByDepartmentIgnoreCase(String department);
}