
package com.ems.repository;

import com.ems.common.InterviewStatus;
import com.ems.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface InterviewerDashboardRepository
        extends JpaRepository<Interview, Long> {

    long countByInterviewerIdAndInterviewDateTimeBetween(
            Long interviewerId,
            LocalDateTime start,
            LocalDateTime end
    );

    long countByInterviewerIdAndInterviewDateTimeAfter(
            Long interviewerId,
            LocalDateTime dateTime
    );

    long countByInterviewerIdAndStatus(
            Long interviewerId,
            InterviewStatus status
    );

    List<Interview>
    findByInterviewerIdAndInterviewDateTimeBetweenOrderByInterviewDateTimeAsc(
            Long interviewerId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Interview>
    findByInterviewerIdAndStatusOrderByInterviewDateTimeAsc(
            Long interviewerId,
            InterviewStatus status
    );
}