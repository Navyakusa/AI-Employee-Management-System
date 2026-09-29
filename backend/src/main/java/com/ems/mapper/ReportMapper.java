package com.ems.mapper;

import com.ems.dto.ReportAnalyticsDto;
import com.ems.entity.Application;
import com.ems.entity.Department;
import com.ems.entity.Interview;
import com.ems.entity.Job;
import com.ems.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ReportMapper {

    @Mapping(
            target = "totalUsers",
            expression = "java((long) users.size())"
    )
    @Mapping(
            target = "activeUsers",
            expression = "java(countActiveUsers(users))"
    )
    @Mapping(
            target = "totalDepartments",
            expression = "java((long) departments.size())"
    )
    @Mapping(
            target = "totalJobs",
            expression = "java((long) jobs.size())"
    )
    @Mapping(
            target = "totalApplications",
            expression = "java((long) applications.size())"
    )
    @Mapping(
            target = "totalInterviews",
            expression = "java((long) interviews.size())"
    )

    @Mapping(
            target = "roleDistribution",
            expression = "java(getRoleDistribution(users))"
    )
    @Mapping(
            target = "departmentStatusDistribution",
            expression = "java(getDepartmentStatusDistribution(departments))"
    )
    @Mapping(
            target = "jobsByDepartment",
            expression = "java(getJobsByDepartment(jobs))"
    )
    @Mapping(
            target = "jobStatusDistribution",
            expression = "java(getJobStatusDistribution(jobs))"
    )
    @Mapping(
            target = "applicationStatusDistribution",
            expression = "java(getApplicationStatusDistribution(applications))"
    )
    @Mapping(
            target = "interviewStatusDistribution",
            expression = "java(getInterviewStatusDistribution(interviews))"
    )

    @Mapping(
            target = "applicationTrends",
            expression = "java(getApplicationTrends(applications))"
    )
    @Mapping(
            target = "interviewTrends",
            expression = "java(getInterviewTrends(interviews))"
    )
    @Mapping(
            target = "jobTrends",
            expression = "java(getJobTrends(jobs))"
    )

    @Mapping(
            target = "applicationToInterviewRate",
            expression = "java(calculateApplicationToInterviewRate(applications, interviews))"
    )
    @Mapping(
            target = "selectionRate",
            expression = "java(calculateApplicationStatusRate(applications, \"SELECTED\"))"
    )
    @Mapping(
            target = "rejectionRate",
            expression = "java(calculateApplicationStatusRate(applications, \"REJECTED\"))"
    )
    @Mapping(
            target = "withdrawalRate",
            expression = "java(calculateApplicationStatusRate(applications, \"WITHDRAWN\"))"
    )
    @Mapping(
            target = "interviewCompletionRate",
            expression = "java(calculateInterviewStatusRate(interviews, \"COMPLETED\"))"
    )
    @Mapping(
            target = "interviewCancellationRate",
            expression = "java(calculateInterviewStatusRate(interviews, \"CANCELLED\"))"
    )
    @Mapping(
            target = "applicationsPerJob",
            expression = "java(calculateApplicationsPerJob(applications, jobs))"
    )
    ReportAnalyticsDto toAnalyticsDto(
            List<User> users,
            List<Department> departments,
            List<Job> jobs,
            List<Application> applications,
            List<Interview> interviews
    );

    default long countActiveUsers(List<User> users) {
        return users.stream()
                .filter(user -> Boolean.TRUE.equals(user.getActive()))
                .count();
    }

    default Map<String, Long> getRoleDistribution(List<User> users) {
        return users.stream()
                .filter(user -> user.getRole() != null)
                .collect(Collectors.groupingBy(
                        user -> normalize(user.getRole()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getDepartmentStatusDistribution(
            List<Department> departments
    ) {
        return departments.stream()
                .filter(department -> department.getStatus() != null)
                .collect(Collectors.groupingBy(
                        department -> normalize(department.getStatus()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getJobsByDepartment(List<Job> jobs) {
        return jobs.stream()
                .filter(job -> job.getDepartment() != null)
                .filter(job -> !job.getDepartment().isBlank())
                .collect(Collectors.groupingBy(
                        job -> normalize(job.getDepartment()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getJobStatusDistribution(List<Job> jobs) {
        return jobs.stream()
                .filter(job -> job.getStatus() != null)
                .collect(Collectors.groupingBy(
                        job -> normalize(job.getStatus()),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getApplicationStatusDistribution(
            List<Application> applications
    ) {
        return applications.stream()
                .filter(application -> application.getStatus() != null)
                .collect(Collectors.groupingBy(
                        application -> normalize(
                                application.getStatus().name()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getInterviewStatusDistribution(
            List<Interview> interviews
    ) {
        return interviews.stream()
                .filter(interview -> interview.getStatus() != null)
                .collect(Collectors.groupingBy(
                        interview -> normalize(
                                interview.getStatus().name()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getApplicationTrends(
            List<Application> applications
    ) {
        return applications.stream()
                .filter(application -> application.getAppliedAt() != null)
                .collect(Collectors.groupingBy(
                        application -> formatMonth(
                                application.getAppliedAt()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getInterviewTrends(
            List<Interview> interviews
    ) {
        return interviews.stream()
                .filter(interview -> interview.getInterviewDateTime() != null)
                .collect(Collectors.groupingBy(
                        interview -> formatMonth(
                                interview.getInterviewDateTime()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default Map<String, Long> getJobTrends(List<Job> jobs) {
        return jobs.stream()
                .filter(job -> job.getCreatedDate() != null)
                .collect(Collectors.groupingBy(
                        job -> formatMonth(
                                job.getCreatedDate()
                        ),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    default double calculateApplicationToInterviewRate(
            List<Application> applications,
            List<Interview> interviews
    ) {
        if (applications.isEmpty()) {
            return 0.0;
        }

        return percentage(
                interviews.size(),
                applications.size()
        );
    }

    default double calculateApplicationStatusRate(
            List<Application> applications,
            String status
    ) {
        if (applications.isEmpty()) {
            return 0.0;
        }

        Map<String, Long> distribution =
                getApplicationStatusDistribution(applications);

        long count = distribution.getOrDefault(
                normalize(status),
                0L
        );

        return percentage(
                count,
                applications.size()
        );
    }

    default double calculateInterviewStatusRate(
            List<Interview> interviews,
            String status
    ) {
        if (interviews.isEmpty()) {
            return 0.0;
        }

        Map<String, Long> distribution =
                getInterviewStatusDistribution(interviews);

        long count = distribution.getOrDefault(
                normalize(status),
                0L
        );

        return percentage(
                count,
                interviews.size()
        );
    }

    default double calculateApplicationsPerJob(
            List<Application> applications,
            List<Job> jobs
    ) {
        if (jobs.isEmpty()) {
            return 0.0;
        }

        return round(
                (double) applications.size()
                        / jobs.size()
        );
    }

    default double percentage(
            long value,
            long total
    ) {
        if (total == 0) {
            return 0.0;
        }

        return round(
                ((double) value / total) * 100
        );
    }

    default double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    default String formatMonth(
            LocalDateTime dateTime
    ) {
        return dateTime.format(
                DateTimeFormatter.ofPattern("yyyy-MM")
        );
    }

    default String normalize(String value) {
        return value
                .trim()
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");
    }
}