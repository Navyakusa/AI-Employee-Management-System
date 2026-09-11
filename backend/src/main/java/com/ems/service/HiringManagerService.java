package com.ems.service;

import com.ems.dto.HiringManagerDashboardDto;
import com.ems.entity.User;
import com.ems.repository.ApplicationRepository;
import com.ems.repository.InterviewRepository;
import com.ems.repository.JobRepository;
import com.ems.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class HiringManagerService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    public HiringManagerService(
            UserRepository userRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            InterviewRepository interviewRepository
    ) {
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.interviewRepository = interviewRepository;
    }

    public HiringManagerDashboardDto getDashboard(
            String email
    ) {

        User hiringManager = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Hiring manager not found"
                        )
                );

        if (!"HIRING_MANAGER".equalsIgnoreCase(
                hiringManager.getRole()
        )) {
            throw new RuntimeException(
                    "User is not a hiring manager"
            );
        }

        String department =
                hiringManager.getDepartment();

        if (department == null ||
                department.isBlank()) {
            throw new RuntimeException(
                    "Department is not assigned to hiring manager"
            );
        }

        long totalJobs =
                jobRepository
                        .countByDepartmentIgnoreCase(
                                department
                        );

        long openJobs =
                jobRepository
                        .countByDepartmentIgnoreCaseAndStatusIgnoreCase(
                                department,
                                "OPEN"
                        );

        long totalApplications =
                applicationRepository
                        .countApplicationsByDepartment(
                                department
                        );

        long totalInterviews =
                interviewRepository
                        .countInterviewsByDepartment(
                                department
                        );

        return new HiringManagerDashboardDto(
                totalJobs,
                openJobs,
                totalApplications,
                totalInterviews,
                department
        );
    }
}