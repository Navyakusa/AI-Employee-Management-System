package com.ems.repository;

import com.ems.common.EvaluationStatus;
import com.ems.entity.InterviewEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewEvaluationRepository
        extends JpaRepository<InterviewEvaluation, Long> {

    List<InterviewEvaluation> findByInterviewerId(Long interviewerId);

    List<InterviewEvaluation> findByInterviewerIdAndStatus(
            Long interviewerId,
            EvaluationStatus status
    );

    Optional<InterviewEvaluation> findByInterviewIdAndInterviewerId(
            Long interviewId,
            Long interviewerId
    );

    long countByInterviewerId(Long interviewerId);

    long countByInterviewerIdAndStatus(
            Long interviewerId,
            EvaluationStatus status
    );
}