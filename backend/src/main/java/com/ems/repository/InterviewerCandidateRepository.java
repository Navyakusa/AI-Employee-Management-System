package com.ems.repository;

import com.ems.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewerCandidateRepository
        extends JpaRepository<Interview, Long> {

    List<Interview> findByInterviewerId(Long interviewerId);

    List<Interview> findByInterviewerIdAndJobId(
            Long interviewerId,
            Long jobId
    );
}