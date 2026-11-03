
        package com.ems.service;

import com.ems.common.InterviewStatus;
import com.ems.entity.Interview;
import com.ems.repository.InterviewRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class InterviewStatusScheduler {

    private final InterviewRepository interviewRepository;

    public InterviewStatusScheduler(
            InterviewRepository interviewRepository) {
        this.interviewRepository = interviewRepository;
    }

    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void markMissedInterviews() {

        LocalDateTime cutoffTime =
                LocalDateTime.now().minusMinutes(30);

        List<Interview> interviews =
                interviewRepository.findAll();

        for (Interview interview : interviews) {

            if (interview.getStatus() == InterviewStatus.SCHEDULED
                    && interview.getInterviewDateTime() != null
                    && interview.getInterviewDateTime()
                    .isBefore(cutoffTime)) {

                interview.setStatus(
                        InterviewStatus.NOT_ATTENDED
                );

                interviewRepository.save(interview);
            }
        }
    }
}
