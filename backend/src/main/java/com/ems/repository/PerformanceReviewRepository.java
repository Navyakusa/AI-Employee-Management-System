
package com.ems.repository;

import com.ems.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository
        extends JpaRepository<PerformanceReview, Long> {

    List<PerformanceReview> findByEmployeeIdOrderByReviewDateDesc(
            Long employeeId
    );

    Optional<PerformanceReview> findByIdAndEmployeeId(
            Long id,
            Long employeeId
    );

    List<PerformanceReview> findAllByOrderByReviewDateDesc();
}
