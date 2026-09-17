
package com.ems.repository;

import com.ems.entity.PerformanceSkillScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceSkillScoreRepository
        extends JpaRepository<PerformanceSkillScore, Long> {

    List<PerformanceSkillScore> findByPerformanceReviewId(Long performanceReviewId);
}