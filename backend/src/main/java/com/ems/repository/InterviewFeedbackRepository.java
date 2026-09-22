package com.ems.repository;

import com.ems.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewFeedbackRepository
        extends JpaRepository<InterviewFeedback, Long> {

    Optional<InterviewFeedback> findByInterviewId(
            Long interviewId
    );

    boolean existsByInterviewId(
            Long interviewId
    );

    List<InterviewFeedback> findByInterviewerId(
            Long interviewerId
    );

    Optional<InterviewFeedback> findByInterviewIdAndInterviewerId(
            Long interviewId,
            Long interviewerId
    );
}