
package com.ems.service;

import com.ems.common.ApplicationStatus;
import com.ems.common.InterviewStatus;
import com.ems.dto.HiringManagerDashboardDto;
import com.ems.entity.Application;
import com.ems.entity.Interview;
import com.ems.entity.User;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.InterviewFeedbackRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HiringManagerService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final InterviewFeedbackRepository interviewFeedbackRepository;

    public HiringManagerService(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository,
            InterviewFeedbackRepository interviewFeedbackRepository) {

        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
        this.interviewFeedbackRepository = interviewFeedbackRepository;
    }

    private User getHiringManager(String email) {

        User hiringManager = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException("Hiring manager not found"));

        if (hiringManager.getRole() == null
                || !"HIRING_MANAGER".equalsIgnoreCase(
                hiringManager.getRole())) {
            throw new RuntimeException(
                    "User is not a hiring manager");
        }

        return hiringManager;
    }

    // Hiring Manager Dashboard
    public HiringManagerDashboardDto getDashboard(String email) {

        User hiringManager = getHiringManager(email);

        Long hiringManagerId = hiringManager.getUserId();
        String department = hiringManager.getDepartment();

        long totalJobs = jobRepository
                .countByHiringManagerId(hiringManagerId);

        long openJobs = jobRepository
                .findByHiringManagerId(hiringManagerId)
                .stream()
                .filter(job -> job.getStatus() != null
                        && "OPEN".equalsIgnoreCase(job.getStatus()))
                .count();

        long totalApplications = applicationRepository
                .countByHiringManagerId(hiringManagerId);

        long totalInterviews = interviewRepository
                .countByHiringManagerId(hiringManagerId);

        long pendingDecisions = 0;

        List<Application> shortlisted =
                applicationRepository
                        .findByStatusAndHiringManagerId(
                                ApplicationStatus.SHORTLISTED,
                                hiringManagerId
                        );

        for (Application application : shortlisted) {

            Interview interview = interviewRepository
                    .findFirstByApplicationIdOrderByInterviewDateTimeDesc(
                            application.getApplicationId()
                    )
                    .orElse(null);

            if (interview == null) {
                continue;
            }

            if (interview.getStatus() != InterviewStatus.COMPLETED) {
                continue;
            }

            if (interviewFeedbackRepository.existsByInterviewId(
                    interview.getInterviewId())) {
                pendingDecisions++;
            }
        }

        return new HiringManagerDashboardDto(
                totalJobs,
                openJobs,
                totalApplications,
                totalInterviews,
                pendingDecisions,
                department
        );
    }

    // Shortlisted candidates for the logged-in hiring manager
    public List<Application> getShortlistedCandidates(String email) {

        User hiringManager = getHiringManager(email);

        Long hiringManagerId = hiringManager.getUserId();

        return applicationRepository
                .findByStatusAndHiringManagerId(
                        ApplicationStatus.SHORTLISTED,
                        hiringManagerId
                );
    }
}
