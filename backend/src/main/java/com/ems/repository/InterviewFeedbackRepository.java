package com.ems.repository;

import com.ems.entity.InterviewFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {

    Optional<InterviewFeedback> findByInterviewId(Long interviewId);

    boolean existsByInterviewId(Long interviewId);

}